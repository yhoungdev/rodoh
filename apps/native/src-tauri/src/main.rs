// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use anyhow::Result;
use chrono::Local;
use screenshots::Screen;
use std::{
    fs,
    path::{Path, PathBuf},
    sync::{Arc, Mutex},
    time::Duration,
};
use tauri::State;
use tokio::time::sleep;

#[derive(Default)]
struct RecordingState {
    is_recording: bool,
    is_paused: bool,
    current_recording_path: Option<String>,
}

struct AppState {
    recording_state: Arc<Mutex<RecordingState>>,
}

#[tauri::command]
async fn start_recording(state: State<'_, AppState>) -> Result<(), String> {
    let mut recording_state = state.recording_state.lock().unwrap();
    if recording_state.is_recording {
        return Err("Recording is already in progress".to_string());
    }

    let output_dir = std::env::temp_dir().join("screen_recorder");
    fs::create_dir_all(&output_dir).map_err(|e| e.to_string())?;

    let timestamp = Local::now().format("%Y%m%d_%H%M%S");
    let output_path = output_dir.join(format!("recording_{}.mp4", timestamp));
    recording_state.current_recording_path = Some(output_path.to_str().unwrap().to_string());
    recording_state.is_recording = true;
    recording_state.is_paused = false;

    let recording_path = output_path.clone();
    tokio::spawn(async move {
        record_screen(recording_path).await.unwrap_or_else(|e| {
            eprintln!("Recording error: {}", e);
        });
    });

    Ok(())
}

#[tauri::command]
async fn stop_recording(state: State<'_, AppState>) -> Result<(), String> {
    let mut recording_state = state.recording_state.lock().unwrap();
    if !recording_state.is_recording {
        return Err("No recording in progress".to_string());
    }

    recording_state.is_recording = false;
    recording_state.is_paused = false;
    Ok(())
}

#[tauri::command]
async fn pause_recording(state: State<'_, AppState>) -> Result<(), String> {
    let mut recording_state = state.recording_state.lock().unwrap();
    if !recording_state.is_recording {
        return Err("No recording in progress".to_string());
    }

    recording_state.is_paused = !recording_state.is_paused;
    Ok(())
}

#[tauri::command]
async fn get_recording_path(state: State<'_, AppState>) -> Result<String, String> {
    let recording_state = state.recording_state.lock().unwrap();
    recording_state
        .current_recording_path
        .clone()
        .ok_or_else(|| "No recording available".to_string())
}

#[tauri::command]
async fn trim_video(
    input_path: String,
    start_time: f64,
    end_time: f64,
) -> Result<(), String> {
    let output_path = Path::new(&input_path)
        .with_file_name(format!(
            "{}_trimmed.mp4",
            Local::now().format("%Y%m%d_%H%M%S")
        ));

    // Use ffmpeg to trim the video
    let status = std::process::Command::new("ffmpeg")
        .arg("-i")
        .arg(&input_path)
        .arg("-ss")
        .arg(start_time.to_string())
        .arg("-t")
        .arg((end_time - start_time).to_string())
        .arg("-c")
        .arg("copy")
        .arg(output_path.to_str().unwrap())
        .status()
        .map_err(|e| e.to_string())?;

    if !status.success() {
        return Err("Failed to trim video".to_string());
    }

    Ok(())
}

async fn record_screen(output_path: PathBuf) -> Result<()> {
    let screen = Screen::all()?[0];
    let mut frame_count = 0;
    let temp_dir = tempfile::tempdir()?;

    while frame_count < 3000 { 
        let image = screen.capture()?;
        let frame_path = temp_dir.path().join(format!("frame_{:05}.png", frame_count));
        image.save(&frame_path)?;
        frame_count += 1;
        sleep(Duration::from_millis(40)).await; 
    }


    let status = std::process::Command::new("ffmpeg")
        .arg("-framerate")
        .arg("25")
        .arg("-i")
        .arg(temp_dir.path().join("frame_%05d.png").to_str().unwrap())
        .arg("-c:v")
        .arg("libx264")
        .arg("-pix_fmt")
        .arg("yuv420p")
        .arg(output_path.to_str().unwrap())
        .status()?;

    if !status.success() {
        anyhow::bail!("Failed to create video from frames");
    }

    Ok(())
}

fn main() {
    let app_state = AppState {
        recording_state: Arc::new(Mutex::new(RecordingState::default())),
    };

    tauri::Builder::default()
        .manage(app_state)
        .invoke_handler(tauri::generate_handler![
            start_recording,
            stop_recording,
            pause_recording,
            get_recording_path,
            trim_video
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
