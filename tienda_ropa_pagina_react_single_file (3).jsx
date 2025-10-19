<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Mi Tienda de Ropa</title>
  <style>
    body { font-family: Arial, sans-serif; background: #f6f6f6; margin: 0; padding: 20px; }
    h1 { text-align: center; }
    form, .product-grid { background: #fff; border-radius: 10px; padding: 15px; max-width: 900px; margin: 20px auto; box-shadow: 0 2px 5px rgba(0,0,0,0.1); }
    input, textarea, button, select { width: 100%; margin-top: 5px; padding: 8px; border-radius: 5px; border: 1px solid #ccc; }
    button { cursor: pointer; background: #007bff; color: #fff; border: none; }
    button:hover { background: #0056b3; }
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 15px; }
    .card { background: #fff; border-radius: 10px; padding: 10px; box-shadow: 0 2px 5px rgba(0,0,0,0.1); }
    .card img { width: 100%; height: 200px; object-fit: cover; border-radius: 8px; }
    .actions { display: flex; justify-content: space-between; margin-top: 10px; }
    .actions button { flex: 1; margin: 0 3px; }
  </style>
</head>
<body>
  <h1>Mi Tienda de Ropa</h1>
  <p style="text-align:center;color:#555">Sube fotos, pon descripción y precio. Todo se guarda en tu navegador.</p>

  <form id="productForm">
    <label>Nombre del producto</label>
    <input type="text" id="title" required placeholder="Ej: Blusa azul" />

    <label>Descripción</label>
    <textarea id="description" rows="3" placeholder="Detalles: talla, material, estado..."></textarea>

    <label>Precio (MXN)</label>
    <input type="number" id="price" step="0.01" placeholder="0.00" required />

    <label>Fotos (puedes elegir varias)</label>
    <input type="file" id="images" accept="image/*" multiple />

    <div style="margin-top:10px;display:flex;gap:10px;">
      <button type="submit">Agregar producto</button>
      <button type="button" id="clearForm" style="background:#999;">Limpiar</button>
    </div>
  </form>

  <div style="max-width:900px;margin:10px auto;display:flex;justify-content:space-between;align-items:center;">
    <input type="text" id="search" placeholder="Buscar producto..." style="flex:1;margin-right:10px;padding:8px;border-radius:5px;border:1px solid #ccc;" />
    <select id="sort">
      <option value="newest">Más nuevos</option>
      <option value="price-asc">Precio: menor a mayor</option>
      <option value="price-desc">Precio: mayor a menor</option>
    </select>
  </div>

  <div class="product-grid">
    <div class="grid" id="productList"></div>
  </div>

  <script>
    const form = document.getElementById('productForm');
    const title = document.getElementById('title');
    const description = document.getElementById('description');
    const price = document.getElementById('price');
    const imagesInput = document.getElementById('images');
    const productList = document.getElementById('productList');
    const searchInput = document.getElementById('search');
    const sortSelect = document.getElementById('sort');
    const clearBtn = document.getElementById('clearForm');

    let products = JSON.parse(localStorage.getItem('ropa_products') || '[]');

    function saveProducts() {
      localStorage.setItem('ropa_products', JSON.stringify(products));
    }

    function renderProducts() {
      const q = searchInput.value.toLowerCase();
      let filtered = products.filter(p => p.title.toLowerCase().includes(q) || p.description.toLowerCase().includes(q));
      const sort = sortSelect.value;
      if (sort === 'price-asc') filtered.sort((a,b)=>a.price-b.price);
      else if (sort === 'price-desc') filtered.sort((a,b)=>b.price-a.price);
      else filtered.sort((a,b)=>b.createdAt - a.createdAt);

      productList.innerHTML = '';
      if (filtered.length === 0) {
        productList.innerHTML = '<p style="text-align:center;color:#888;width:100%">No hay productos.</p>';
        return;
      }
      for (const p of filtered) {
        const div = document.createElement('div');
        div.className = 'card';
        div.innerHTML = `
          <img src="${p.images[0] || ''}" alt="${p.title}" />
          <h3>${p.title}</h3>
          <p>${p.description}</p>
          <strong>$${p.price.toFixed(2)}</strong>
          <div class="actions">
            <button onclick="deleteProduct('${p.id}')" style="background:#e74c3c">Eliminar</button>
          </div>
        `;
        productList.appendChild(div);
      }
    }

    async function fileToDataURL(file) {
      return new Promise((res, rej) => {
        const reader = new FileReader();
        reader.onload = () => res(reader.result);
        reader.onerror = rej;
        reader.readAsDataURL(file);
      });
    }

    form.addEventListener('submit', async e => {
      e.preventDefault();
      const imgs = await Promise.all(Array.from(imagesInput.files).map(fileToDataURL));
      const p = {
        id: Date.now().toString(),
        title: title.value.trim(),
        description: description.value.trim(),
        price: parseFloat(price.value) || 0,
        images: imgs,
        createdAt: Date.now()
      };
      products.unshift(p);
      saveProducts();
      renderProducts();
      form.reset();
    });

    clearBtn.onclick = ()=> form.reset();

    searchInput.oninput = renderProducts;
    sortSelect.onchange = renderProducts;

    function deleteProduct(id) {
      if (!confirm('¿Eliminar producto?')) return;
      products = products.filter(p => p.id !== id);
      saveProducts();
      renderProducts();
    }

    renderProducts();
  </script>
</body>
</html>
