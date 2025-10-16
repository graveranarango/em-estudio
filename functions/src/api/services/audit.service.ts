import { initializeApp } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import appLogger from "../../lib/logger";

initializeApp();

interface AuditRecord {
  uid: string;
  role: string;
  action: string;
  resource: { type: string; id: string };
  status: "success" | "failure";
  timestamp: FirebaseFirestore.FieldValue;
  details?: object;
}

class AuditService {
  private db = getFirestore();
  private auditCollection = this.db.collection("audits");

  public async record(record: Omit<AuditRecord, "timestamp">) {
    const fullRecord: AuditRecord = {
      ...record,
      timestamp: FieldValue.serverTimestamp(),
    };

    try {
      await this.auditCollection.add(fullRecord);
      appLogger.audit({
        ...record,
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      appLogger.error("Failed to record audit trail to Firestore", err, { record });
    }
  }
}

export const auditService = new AuditService();
