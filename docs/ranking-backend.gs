// バット工房 共有ランキング バックエンド (Google Apps Script)
// スプレッドシートに記録を保存し、JSON APIとして公開する。
// セットアップ手順は ranking-setup.md を参照。

const SHEET_NAME = 'rank';
const MAX_RETURN = 50;          // GETで返す最大件数
const VALID_MATS = ['wood', 'carbon', 'metal', 'gold', 'diamond', 'obsidian'];

function getSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(SHEET_NAME);
  if (!sh) {
    sh = ss.insertSheet(SHEET_NAME);
    sh.appendRow(['name', 'total', 'mat', 'date']);
  }
  return sh;
}

// ランキング取得: 総飛距離の降順で上位MAX_RETURN件をJSONで返す
function doGet() {
  const sh = getSheet();
  const last = sh.getLastRow();
  const rows = last > 1 ? sh.getRange(2, 1, last - 1, 4).getValues() : [];
  const list = rows
    .map(r => ({ name: String(r[0]).slice(0, 10), total: Number(r[1]) || 0,
                 mat: String(r[2]), date: Number(r[3]) || 0 }))
    .sort((a, b) => b.total - a.total)
    .slice(0, MAX_RETURN);
  return ContentService.createTextOutput(JSON.stringify(list))
    .setMimeType(ContentService.MimeType.JSON);
}

// 記録登録: {name, total, mat, date} を1行追記する
function doPost(e) {
  let ok = false;
  try {
    const d = JSON.parse(e.postData.contents);
    const name = String(d.name || '名無しの強打者').slice(0, 10);
    const total = Math.round(Number(d.total));
    const mat = VALID_MATS.indexOf(String(d.mat)) >= 0 ? String(d.mat) : 'wood';
    const date = Number(d.date) || Date.now();
    // 異常値ガード（負値・非数・非現実的な距離は捨てる）
    if (isFinite(total) && total > 0 && total < 10000000) {
      getSheet().appendRow([name, total, mat, date]);
      ok = true;
    }
  } catch (err) {}
  return ContentService.createTextOutput(JSON.stringify({ ok: ok }))
    .setMimeType(ContentService.MimeType.JSON);
}
