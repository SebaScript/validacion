const http = require('http');
const url = require('url');

const PORT = process.env.PORT ? Number(process.env.PORT) : 3100;

// In-memory data for products and categories
let products = [
	{ productId: 1, name: 'Stub Product 1', description: 'D1', price: 10, stock: 5, categoryId: 1 },
	{ productId: 2, name: 'Stub Product 2', description: 'D2', price: 20, stock: 3, categoryId: 2 },
];
let nextProductId = 3;
let categories = [
	{ categoryId: 1, name: 'Cat 1' },
	{ categoryId: 2, name: 'Cat 2' },
];

function send(res, status, body, headers = {}) {
	const data = typeof body === 'string' ? body : JSON.stringify(body);
	res.writeHead(status, { 'Content-Type': 'application/json', ...headers });
	res.end(data);
}

function parseBody(req) {
	return new Promise((resolve) => {
		let raw = '';
		req.on('data', (chunk) => (raw += chunk));
		req.on('end', () => {
			try { resolve(raw ? JSON.parse(raw) : {}); } catch { resolve({}); }
		});
	});
}

function isAuth(req) {
	const auth = req.headers['authorization'] || '';
	return auth.startsWith('Bearer ');
}

const server = http.createServer(async (req, res) => {
	const parsed = url.parse(req.url, true);
	const method = req.method || 'GET';
	const path = parsed.pathname || '/';

	// CORS
	if (method === 'OPTIONS') {
		res.writeHead(204, {
			'Access-Control-Allow-Origin': '*',
			'Access-Control-Allow-Methods': 'GET,POST,PATCH,PUT,DELETE,OPTIONS',
			'Access-Control-Allow-Headers': 'Content-Type, Authorization',
		});
		return res.end();
	}

	const corsHeaders = {
		'Access-Control-Allow-Origin': '*',
	};

	// Root health
	if (method === 'GET' && path === '/') {
		return send(res, 200, { message: 'Hello World (stub)' }, corsHeaders);
	}

	// Categories
	if (method === 'GET' && path === '/categories') {
		return send(res, 200, categories, corsHeaders);
	}

	// Products collection
	if (method === 'GET' && path === '/products') {
		return send(res, 200, products, corsHeaders);
	}
	if (method === 'POST' && path === '/products') {
		const body = await parseBody(req);
		if (!body || typeof body.name !== 'string' || typeof body.price !== 'number') {
			return send(res, 400, { message: 'Invalid body' }, corsHeaders);
		}
		const created = { productId: nextProductId++, stock: 0, description: '', categoryId: 1, ...body };
		products.push(created);
		return send(res, 201, created, corsHeaders);
	}

	// Product item by id
	const productIdMatch = path.match(/^\/products\/(\w+)$/);
	if (productIdMatch) {
		const idStr = productIdMatch[1];
		const id = Number(idStr);
		if (!Number.isFinite(id)) {
			return send(res, 400, { message: 'Invalid id' }, corsHeaders);
		}
		if (method === 'GET') {
			const p = products.find((x) => x.productId === id);
			return p ? send(res, 200, p, corsHeaders) : send(res, 404, { message: 'Not found' }, corsHeaders);
		}
		if (method === 'PATCH') {
			const p = products.find((x) => x.productId === id);
			if (!p) return send(res, 404, { message: 'Not found' }, corsHeaders);
			const body = await parseBody(req);
			Object.assign(p, body || {});
			return send(res, 200, p, corsHeaders);
		}
		if (method === 'DELETE') {
			const idx = products.findIndex((x) => x.productId === id);
			if (idx === -1) return send(res, 404, { message: 'Not found' }, corsHeaders);
			const removed = products.splice(idx, 1)[0];
			return send(res, 200, removed, corsHeaders);
		}
	}

	// Cart (require auth header)
	if (path.startsWith('/cart')) {
		if (!isAuth(req)) {
			return send(res, 401, { message: 'Unauthorized (stub)' }, corsHeaders);
		}
		// Minimal behavior for authorized calls
		if (method === 'GET' && path === '/cart/my-cart') {
			return send(res, 200, { cartId: 1, items: [] }, corsHeaders);
		}
		if (method === 'POST' && path === '/cart/add-item') {
			const body = await parseBody(req);
			return send(res, 200, { added: body || {} }, corsHeaders);
		}
		return send(res, 200, { ok: true }, corsHeaders);
	}

	// Admin (require auth header)
	if (path.startsWith('/admin')) {
		if (!isAuth(req)) {
			return send(res, 401, { message: 'Unauthorized (stub)' }, corsHeaders);
		}
		return send(res, 200, { ok: true }, corsHeaders);
	}

	// Fallback
	return send(res, 404, { message: 'Not Found (stub)' }, corsHeaders);
});

server.listen(PORT, () => {
	console.log(`[stub] listening on http://localhost:${PORT}`);
});





