import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getProducts } from '../api/api';
import './HomePage.css';

const initialReviews = [
  { name: "Aziz", comment: "Super service et livraison rapide !", date: "2025-05-15", rating: 5 },
  { name: "Younes", comment: "Produits de qualité, je recommande.", date: "2025-05-14", rating: 4 },
  { name: "Ismail", comment: "Bon rapport qualité/prix.", date: "2025-05-13", rating: 4 },
  { name: "Mohamed", comment: "Bon qualité.", date: "2025-05-14", rating: 3 }
];

const HomePage = () => {
  const [products, setProducts] = useState([]);
  const [reviews, setReviews] = useState(initialReviews);
  const [reviewForm, setReviewForm] = useState({ name: '', comment: '', rating: 5 });
  const [currentSlide, setCurrentSlide] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    // Récupère les produits pour la section "nouveaux produits"
    getProducts().then(res => {
      setProducts(res.data.slice(-3).reverse()); // Les 3 derniers produits
    });

    // Gestion du slider automatique
    const interval = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % 3);
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);

  const handleReviewSubmit = (e) => {
    e.preventDefault();
    if (!reviewForm.name || !reviewForm.comment) return;
    setReviews([
      { ...reviewForm, date: new Date().toISOString().slice(0, 10) },
      ...reviews
    ]);
    setReviewForm({ name: '', comment: '', rating: 5 });
  };

  // Fonction pour changer manuellement le slide
  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  return (
    <div className="home-container">
      {/* Hero Slider */}
      <div className="hero-slider">
        <div className={`slide ${currentSlide === 0 ? 'active' : ''}`}>
          <div className="slide-content">
            <h1>Découvrez nos produits exclusifs</h1>
            <p>Des promotions exceptionnelles vous attendent</p>
            <Link to="/products" className="btn btn-primary">Découvrir</Link>
          </div>
          <img src="/images/slider1.png" alt="Promotion spéciale" />
        </div>
        
        <div className={`slide ${currentSlide === 1 ? 'active' : ''}`}>
          <div className="slide-content">
            <h1>Livraison rapide au Maroc</h1>
            <p>Recevez vos commandes en 24-48h</p>
            <Link to="/products" className="btn btn-primary">Acheter maintenant</Link>
          </div>
          <img src="/images/slider2.png" alt="Livraison rapide" />
        </div>
        
        <div className={`slide ${currentSlide === 2 ? 'active' : ''}`}>
          <div className="slide-content">
            <h1>Des produits de qualité supérieure</h1>
            <p>Certifiés et testés par nos experts</p>
            <Link to="/products" className="btn btn-primary">Voir le catalogue</Link>
          </div>
          <img src="/images/slider3.png" alt="Produits de qualité" />
        </div>
        
        <div className="slider-controls">
          {[0, 1, 2].map(index => (
            <button 
              key={index} 
              className={`slider-dot ${currentSlide === index ? 'active' : ''}`}
              onClick={() => goToSlide(index)}
              aria-label={`Aller au slide ${index + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Section Description Entreprise */}
      <section className="about-section">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-6 mb-4 mb-lg-0">
              <img src="/images/logoSysteme.png" alt="E-co-maroc" className="img-fluid rounded-4 shadow" />
            </div>
            <div className="col-lg-6">
              <h2 className="section-title">Bienvenue chez E-co-maroc</h2>
              <p className="lead">
                E-co-maroc est votre partenaire de confiance pour tous vos besoins en ligne. Nous proposons une large gamme de produits certifiés, une livraison rapide partout au Maroc et un service client à votre écoute 7j/7.
              </p>
              <p>
                Notre mission : vous offrir le meilleur, au meilleur prix. Avec plus de 10 000 clients satisfaits, nous nous engageons à vous fournir une expérience d'achat exceptionnelle.
              </p>
              <div className="stats-container mt-4">
                <div className="stat-item">
                  <span className="stat-value">10K+</span>
                  <span className="stat-label">Clients satisfaits</span>
                </div>
                <div className="stat-item">
                  <span className="stat-value">500+</span>
                  <span className="stat-label">Produits</span>
                </div>
                <div className="stat-item">
                  <span className="stat-value">24/48h</span>
                  <span className="stat-label">Livraison</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section Nouveaux Produits */}
      <section className="new-products-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Nouveaux Produits</h2>
            <Link to="/products" className="view-all">Voir tout</Link>
          </div>
          
          <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
            {products.map(product => (
              <div className="col" key={product._id}>
                <div 
                  className="card h-100 product-card"
                  onClick={() => navigate(`/product/${product._id}`)}
                >
                  <div className="product-image-container">
                    {product.images?.[0] && (
                      <img
                        src={`http://localhost:5002${product.images[0]}`}
                        className="card-img-top"
                        alt={product.name}
                      />
                    )}
                    <div className="product-badge">Nouveau</div>
                  </div>
                  <div className="card-body">
                    <h5 className="card-title">{product.name}</h5>
                    <p className="card-text">{product.description.substring(0, 80)}...</p>
                    <div className="product-rating">
                      {[...Array(5)].map((_, i) => (
                        <i key={i} className={`bi ${i < 4 ? 'bi-star-fill text-warning' : 'bi-star text-muted'}`}></i>
                      ))}
                      <span className="rating-count">(24)</span>
                    </div>
                  </div>
                  <div className="card-footer d-flex justify-content-between align-items-center">
                    <span className="price">{product.price} DH</span>
                    <button className="btn btn-sm btn-outline-primary">
                      <i className="bi bi-cart-plus"></i> Ajouter
                    </button>
                  </div>
                </div>
              </div>
            ))}
            
            {products.length === 0 && (
              <div className="col-12 text-center py-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Chargement...</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Section Services */}
      <section className="services-section">
        <div className="container">
          <h2 className="section-title text-center mb-5">Nos services</h2>
          <div className="row g-4">
            <div className="col-md-4">
              <div className="service-card text-center p-4 h-100">
                <div className="service-icon">
                  <i className="bi bi-truck"></i>
                </div>
                <h5>Livraison rapide</h5>
                <p>Recevez vos commandes en 24/48h partout au Maroc avec un suivi en temps réel.</p>
              </div>
            </div>
            <div className="col-md-4">
              <div className="service-card text-center p-4 h-100">
                <div className="service-icon">
                  <i className="bi bi-shield-check"></i>
                </div>
                <h5>Produits certifiés</h5>
                <p>Des produits de qualité, testés et approuvés par nos experts avec garantie.</p>
              </div>
            </div>
            <div className="col-md-4">
              <div className="service-card text-center p-4 h-100">
                <div className="service-icon">
                  <i className="bi bi-headset"></i>
                </div>
                <h5>Support 7j/7</h5>
                <p>Notre équipe est à votre écoute pour toute question ou conseil, 7 jours sur 7.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section Avis Clients */}
      <section className="reviews-section">
        <div className="container">
          <h2 className="section-title text-center mb-5">Ce que disent nos clients</h2>
          <div className="row g-4 mb-4">
            {reviews.slice(0, 3).map((r, idx) => (
              <div className="col-md-4" key={idx}>
                <div className="review-card shadow-sm h-100">
                  <div className="review-header">
                    <div className="review-rating">
                      {[...Array(5)].map((_, i) => (
                        <i key={i} className={`bi ${i < r.rating ? 'bi-star-fill text-warning' : 'bi-star text-muted'}`}></i>
                      ))}
                    </div>
                    <span className="review-date">{r.date}</span>
                  </div>
                  <p className="review-text">"{r.comment}"</p>
                  <div className="review-author">
                    <div className="author-avatar">
                      {r.name.charAt(0)}
                    </div>
                    <span className="author-name">{r.name}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Formulaire d'ajout d'avis */}
          <div className="review-form-container mx-auto">
            <h5 className="text-center mb-4">Laisser un avis</h5>
            <form onSubmit={handleReviewSubmit}>
              <div className="mb-3">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Votre nom"
                  value={reviewForm.name}
                  onChange={e => setReviewForm({ ...reviewForm, name: e.target.value })}
                  required
                />
              </div>
              <div className="mb-3">
                <textarea
                  className="form-control"
                  placeholder="Votre avis"
                  rows="3"
                  value={reviewForm.comment}
                  onChange={e => setReviewForm({ ...reviewForm, comment: e.target.value })}
                  required
                />
              </div>
              <div className="mb-3 d-flex align-items-center">
                <span className="me-2">Évaluation :</span>
                {[1,2,3,4,5].map(star => (
                  <i
                    key={star}
                    className={`bi ${reviewForm.rating >= star ? 'bi-star-fill text-warning' : 'bi-star text-muted'}`}
                    style={{cursor: 'pointer', fontSize: '1.3rem'}}
                    onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                  ></i>
                ))}
              </div>
              <button className="btn btn-primary w-100 mt-2" type="submit">Envoyer l'avis</button>
            </form>
          </div>
        </div>
      </section>

      {/* Section Newsletter */}
      <section className="newsletter-section">
        <div className="container">
          <div className="newsletter-card">
            <div className="row align-items-center">
              <div className="col-md-6">
                <h3>Abonnez-vous à notre newsletter</h3>
                <p>Recevez les dernières offres et nouveautés en exclusivité</p>
              </div>
              <div className="col-md-6">
                <div className="input-group">
                  <input type="email" className="form-control" placeholder="Votre email" />
                  <button className="btn btn-primary" type="button">S'abonner</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="row">
            <div className="col-lg-4 mb-4 mb-lg-0">
              <div className="footer-brand">
                <i className="bi bi-cart3 me-2"></i>
                <span>E-co-maroc</span>
              </div>
              <p className="footer-about">
                Votre destination de confiance pour des achats en ligne de qualité au Maroc. Nous proposons les meilleurs produits avec service client exceptionnel.
              </p>
              <div className="social-links">
                <a href="#" aria-label="Facebook"><i className="bi bi-facebook"></i></a>
                <a href="#" aria-label="Instagram"><i className="bi bi-instagram"></i></a>
                <a href="#" aria-label="Twitter"><i className="bi bi-twitter-x"></i></a>
                <a href="#" aria-label="LinkedIn"><i className="bi bi-linkedin"></i></a>
              </div>
            </div>
            
            <div className="col-6 col-md-3 col-lg-2 mb-4 mb-md-0">
              <h5>Navigation</h5>
              <ul className="footer-links">
                <li><Link to="/">Accueil</Link></li>
                <li><Link to="/products">Produits</Link></li>
                <li><Link to="/about">À propos</Link></li>
                <li><Link to="/contact">Contact</Link></li>
              </ul>
            </div>
            
            <div className="col-6 col-md-3 col-lg-2 mb-4 mb-md-0">
              <h5>Catégories</h5>
              <ul className="footer-links">
                <li><Link to="/products/electronics">Électronique</Link></li>
                <li><Link to="/products/fashion">Mode</Link></li>
                <li><Link to="/products/home">Maison</Link></li>
                <li><Link to="/products/beauty">Beauté</Link></li>
              </ul>
            </div>
            
            <div className="col-md-6 col-lg-4">
              <h5>Contact</h5>
              <ul className="footer-contact">
                <li>
                  <i className="bi bi-geo-alt"></i>
                  <span>123 Avenue Mohammed VI, Casablanca, Maroc</span>
                </li>
                <li>
                  <i className="bi bi-telephone"></i>
                  <span>+212 6 12 34 56 78</span>
                </li>
                <li>
                  <i className="bi bi-envelope"></i>
                  <span>contact@e-co-maroc.ma</span>
                </li>
                <li>
                  <i className="bi bi-clock"></i>
                  <span>Lun-Sam: 9h-20h</span>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="footer-bottom">
            <div className="row align-items-center">
              <div className="col-md-6">
                <p>&copy; 2025 E-co-maroc. Tous droits réservés.</p>
              </div>
              <div className="col-md-6">
                <div className="payment-methods">
                  <i className="bi bi-credit-card"></i>
                  <i className="bi bi-paypal"></i>
                  <i className="bi bi-cash-coin"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;