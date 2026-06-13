const API_URL = 'http://187.77.229.227:3335/api/apps/vidracaria';

export async function fetchData(sheet: string): Promise<any[]> {
  try {
    const res = await fetch(`${API_URL}/${sheet}`);
    const json = await res.json();
    if (json.success && json.data) {
      const rows = json.data;
      if (rows.length <= 1) return [];
      const headers = rows[0];
      return rows.slice(1).map((row: any[]) => {
        const obj: any = {};
        headers.forEach((h: string, i: number) => { obj[h] = row[i]; });
        return obj;
      });
    }
    return [];
  } catch (e) {
    console.error(`Error fetching ${sheet}:`, e);
    return [];
  }
}

export async function saveData(sheet: string, data: any[]): Promise<boolean> {
  try {
    if (data.length === 0) return true;
    const headers = Object.keys(data[0]);
    const values = data.map(item => headers.map(h => item[h] ?? ''));
    await fetch(`${API_URL}/${sheet}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ values: [headers, ...values] }),
    });
    return true;
  } catch (e) {
    console.error(`Error saving ${sheet}:`, e);
    return false;
  }
}
