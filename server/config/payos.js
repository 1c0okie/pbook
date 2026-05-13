import { PayOS } from "@payos/node"; // Dùng ngoặc nhọn
import dotenv from "dotenv";

dotenv.config();

// Truyền vào 1 Object thay vì các chuỗi rời rạc
const payos = new PayOS({
  clientId: process.env.PAYOS_CLIENT_ID,
  apiKey: process.env.PAYOS_API_KEY,
  checksumKey: process.env.PAYOS_CHECKSUM_KEY,
});

export default payos;