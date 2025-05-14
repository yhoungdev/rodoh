import Dexie from "dexie";

export interface Recording {
  id: string;
  blob: Blob;
  createdAt: number;
}

class RecordingDB extends Dexie {
  recordings: Dexie.Table<Recording, string>;

  constructor() {
    super("RecordingDB");
    this.version(1).stores({
      recordings: "&id, createdAt",
    });

    this.recordings = this.table("recordings");
  }
}

export const db = new RecordingDB();
