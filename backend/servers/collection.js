import { Router } from 'express';

const sortOrders = {
  RANKING_DESC: 'average_rating DESC, added_at DESC, id ASC',
  RANKING_ASC: 'average_rating ASC, added_at DESC, id ASC',
  DATE_ADDED_ASC: 'added_at ASC, average_rating DESC, id ASC',
  DATE_ADDED_DESC: 'added_at DESC, average_rating DESC, id ASC',
};

function positiveInteger(value) {
  if (typeof value !== 'string' || !/^[1-9]\d*$/.test(value)) return null;
  const number = Number(value);
  return Number.isSafeInteger(number) ? number : null;
}

export function createCollectionRouter(pool) {
  const router = Router();

  const listAlbums = async (req, res) => {
    const legacyLookup = req.path === '/lookup-albums' && req.query.limit === undefined;
    const page = positiveInteger(req.query.page ?? '1');
    const limit = req.query.limit === undefined ? undefined : positiveInteger(req.query.limit);
    const search = req.path === '/lookup-albums' ? req.query.lookupString ?? '' : req.query.search ?? '';
    const sort = req.query.sort ?? 'RANKING_DESC';
    if (!page || (limit !== undefined && (!limit || limit > 100)) || typeof search !== 'string'
        || typeof sort !== 'string' || !Object.hasOwn(sortOrders, sort)) {
      return res.status(400).json({ error: 'Invalid page, limit, search, or sort option.' });
    }

    // Search terms are literal text, including SQL wildcard characters.
    const query = search.trim();
    const values = query ? [`%${query.replace(/[\\%_]/g, '\\$&')}%`] : [];
    const where = query ? ' WHERE (title ILIKE $1 OR artist ILIKE $1)' : '';
    const order = ` ORDER BY ${sortOrders[sort]}`;
    try {
      // Preserve older lookup clients and the full collection used by the tier list.
      if (legacyLookup) {
        const result = await pool.query(`SELECT * FROM albums${where}${order} LIMIT 20`, values);
        return res.json(result.rows);
      }
      if (limit === undefined) {
        const result = await pool.query(`SELECT * FROM albums${where}${order}`, values);
        return res.json({ albums: result.rows });
      }

      const count = await pool.query(`SELECT COUNT(*) FROM albums${where}`, values);
      const totalCount = Number(count.rows[0].count);
      const totalPages = Math.ceil(totalCount / limit);
      const currentPage = Math.min(page, Math.max(1, totalPages));
      const result = await pool.query(
        `SELECT * FROM albums${where}${order} LIMIT $${values.length + 1} OFFSET $${values.length + 2}`,
        [...values, limit, (currentPage - 1) * limit],
      );
      return res.json({ albums: result.rows, page: currentPage, totalPages, totalCount, search: query });
    } catch (error) {
      console.error('Error fetching albums:', error);
      return res.status(500).json({ error: 'Failed to load albums.' });
    }
  };

  router.get('/albums', listAlbums);
  router.get('/lookup-albums', listAlbums);
  return router;
}
