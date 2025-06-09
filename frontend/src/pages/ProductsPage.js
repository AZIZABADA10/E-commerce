import React, { useEffect, useState } from 'react';
import { getProducts } from '../api/api';
import { ToastContainer, toast } from 'react-toastify';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'react-toastify/dist/ReactToastify.css';
import './ProductsPage.css';

const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [cart, setCart] = useState([]);
  const [modalProduct, setModalProduct] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await getProducts();
        const allProducts = response.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setProducts(allProducts);
        setFilteredProducts(allProducts);

        const uniqueCategories = [...new Set(allProducts.map(p => p.category))];
        setCategories(uniqueCategories);
      } catch (err) {
        toast.error("Impossible de récupérer les produits.");
      }
    };

    fetchProducts();

    const savedCart = JSON.parse(localStorage.getItem('cart') || '[]');
    setCart(savedCart);
  }, []);

  useEffect(() => {
    let result = products;

    if (selectedCategory !== 'all') {
      result = result.filter(p => p.category === selectedCategory);
    }

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        p =>
          p.name.toLowerCase().includes(term) ||
          p.description.toLowerCase().includes(term)
      );
    }

    setFilteredProducts(result);
  }, [searchTerm, selectedCategory, products]);

  const addToCart = (product) => {
    const existingItem = cart.find(item => item._id === product._id);
    let newCart;

    if (existingItem) {
      if (existingItem.quantity < product.stockQuantity) {
        newCart = cart.map(item =>
          item._id === product._id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
        toast.success(`Quantité de ${product.name} augmentée !`);
      } else {
        toast.warning("Stock insuffisant !");
        return;
      }
    } else {
      newCart = [...cart, { ...product, quantity: 1 }];
      toast.success(`${product.name} ajouté au panier !`);
    }

    setCart(newCart);
    localStorage.setItem('cart', JSON.stringify(newCart));
  };

  const getCartQuantity = (productId) => {
    const item = cart.find(item => item._id === productId);
    return item ? item.quantity : 0;
  };

  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  const calculateOldPrice = (price) => (price * 1.2).toFixed(2);

  return (
    <div className="container py-4">
      <ToastContainer />
      <header className="mb-4 text-center">
        <h2 className="text-primary fw-bold">Bienvenue dans notre catalogue de produits</h2>
        <p className="text-muted">Découvrez nos meilleures offres classées par catégories</p>
      </header>

      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3 className="text-secondary">Produits</h3>
        <button className="btn btn-outline-primary position-relative">
          <i className="fas fa-shopping-cart"></i> Panier
          {getTotalItems() > 0 && (
            <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
              {getTotalItems()}
            </span>
          )}
        </button>
      </div>

      <div className="row mb-4">
        <div className="col-md-6">
          <input
            type="text"
            className="form-control"
            placeholder="Rechercher un produit..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="col-md-6">
          <select
            className="form-select"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="all">Toutes les catégories</option>
            {categories.map((cat, idx) => (
              <option key={idx} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      {categories.map(cat => (
        <div key={cat} className="mb-5">
          <h4 className="text-dark border-bottom pb-2 mb-3">{cat}</h4>
          <div className="row row-cols-1 row-cols-md-3 g-4">
            {filteredProducts.filter(p => p.category === cat).map(product => (
              <div className="col" key={product._id}>
                <div className="card h-100 shadow-sm">
                  {product.images?.[0] && (
                    <img
                      src={`http://localhost:5002${product.images[0]}`}
                      className="card-img-top"
                      alt={product.name}
                      style={{ objectFit: 'cover', height: '200px' }}
                    />
                  )}
                  <div className="card-body">
                    <h5 className="card-title text-primary">{product.name}</h5>
                    <p className="card-text small">{product.description}</p>
                    <div className="d-flex justify-content-between align-items-center">
                      <span className="text-decoration-line-through text-muted">
                        {calculateOldPrice(product.price)} DH
                      </span>
                      <span className="text-success fw-bold fs-5">
                        {product.price} DH
                      </span>
                    </div>
                    <span className="badge bg-secondary mt-2">Stock: {product.stockQuantity}</span>
                    <div className="mt-3 d-grid gap-2">
                      <button
                        className="btn btn-outline-primary"
                        onClick={() => addToCart(product)}
                        disabled={product.stockQuantity <= 0 || getCartQuantity(product._id) >= product.stockQuantity}
                      >
                        {product.stockQuantity > 0 
                          ? (getCartQuantity(product._id) >= product.stockQuantity 
                              ? 'Stock insuffisant' 
                              : 'Ajouter au panier')
                          : 'Rupture de stock'}
                      </button>
                      <button
                        className="btn btn-info text-white"
                        onClick={() => setModalProduct(product)}
                      >
                        Détail du produit
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {modalProduct && (
        <div className="modal fade show d-block" tabIndex="-1">
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{modalProduct.name}</h5>
                <button type="button" className="btn-close" onClick={() => setModalProduct(null)}></button>
              </div>
              <div className="modal-body">
                <img
                  src={`http://localhost:5002${modalProduct.images?.[0]}`}
                  className="img-fluid mb-3"
                  alt={modalProduct.name}
                />
                <p>{modalProduct.description}</p>
                <p>Catégorie : <strong>{modalProduct.category}</strong></p>
                <p>Prix : <strong className="text-success">{modalProduct.price} DH</strong></p>
                <p>Ancien prix : <span className="text-decoration-line-through">{calculateOldPrice(modalProduct.price)} DH</span></p>
                <p>Stock : {modalProduct.stockQuantity}</p>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setModalProduct(null)}>Fermer</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <footer className="mt-5 pt-4 border-top text-center text-muted">
        &copy; 2025 e-co-maroc. Tous droits réservés.
      </footer>
    </div>
  );
};

export default ProductsPage;
