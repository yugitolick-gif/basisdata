# Security Specification: BasisDataLab Firestore Access Control

## 1. Data Invariants
1. **Visitor Sessions:** A visitor session document must match its path `{sessionId}`, must have bounded strings for device, browser, timestamps, and totalActions must be a number.
2. **Activity Logs:** An activity log document must match its `{logId}` path, must reference a valid `sessionId`, and string lengths must not exceed volumetric limits.
3. **Quiz Results:** A quiz result record must contain valid bounded numeric scores (0-100), total questions, and passed boolean.
4. **Administrative Access:** Admin actions (deleting records, clearing sessions) are restricted strictly to verified administrative credentials or designated admin email (`yugitolick@gmail.com`).
5. **Denial of Wallet Prevention:** All string fields are constrained with `.size() <= max` to prevent storage bloat and payload injection.

## 2. Dirty Dozen Security Payloads
1. **Payload 1 (ID Poisoning):** Document ID with 500 characters `AAAA...` -> Rejected by `isValidId`.
2. **Payload 2 (Ghost Field in VisitorSession):** Payload containing `{ sessionId: "...", role: "admin", isSuperuser: true }` -> Rejected by schema validation.
3. **Payload 3 (Negative Actions Counter):** `totalActions: -9999` or non-numeric -> Rejected by type check.
4. **Payload 4 (Oversized Log Details):** `details` with 50KB string -> Rejected by `.size() <= 500` limit.
5. **Payload 5 (Unauthenticated Delete):** Guest attempting to delete `/visitor_sessions/session_123` -> Rejected (admin only).
6. **Payload 6 (Session ID Mismatch):** Attempting to write `{ sessionId: "xyz" }` to `/visitor_sessions/abc` -> Rejected by path equality check.
7. **Payload 7 (Spoofed Email Admin Update):** Unverified email claiming admin role -> Rejected by `request.auth.token.email_verified == true`.
8. **Payload 8 (Invalid Quiz Score):** Non-numeric score or string injection -> Rejected by type validation.
9. **Payload 9 (Unbounded Array Flooding):** `featuresUsed` array containing 1,000 items -> Rejected by `.size() <= 50` limit.
10. **Payload 10 (Null Path Traversals):** Invalid path characters `../../evil` -> Rejected by regex `^[a-zA-Z0-9_\-]+$`.
11. **Payload 11 (Empty ID String):** ID of length 0 `""` -> Rejected by `id.size() > 0`.
12. **Payload 12 (Direct Document Overwrite by Stranger):** Overwriting another user's existing session ID with a different ID -> Rejected.
