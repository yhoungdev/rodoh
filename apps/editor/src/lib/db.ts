import Dexie from "dexie";

export interface Recording {
  id: string;
  createdAt: number;
  blob: Blob;
}

class RecordingDB extends Dexie {
  recordings: Dexie.Table<Recording, string>;

  constructor() {
    super("RecordingDB");
    this.version(1).stores({
      recordings: "id, createdAt",
    });

    this.recordings = this.table("recordings");
  }
}

export const db = new RecordingDB();
