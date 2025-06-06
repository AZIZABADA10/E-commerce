import React, { useState, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'react-toastify/dist/ReactToastify.css';
import { jsPDF } from 'jspdf';

const CartPage = () => {
  const [cart, setCart] = useState([]);
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [customerInfo, setCustomerInfo] = useState({
    nom: '',
    prenom: '',
    telephone: '',
    email: '',
    adresse: '',
    ville: '',
    codePostal: ''
  });

  useEffect(() => {
    const savedCart = JSON.parse(localStorage.getItem('cart') || '[]');
    setCart(Array.isArray(savedCart) ? savedCart : []);
  }, []);

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }

    const updatedCart = cart.map(item =>
      item._id === productId
        ? { 
            ...item, 
            quantity: Math.min(newQuantity, item.stockQuantity || 100) 
          }
        : item
    );
    
    setCart(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
    toast.success('Quantité mise à jour !');
  };

  const removeFromCart = (productId) => {
    const updatedCart = cart.filter(item => item._id !== productId);
    setCart(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
    toast.success('Produit retiré du panier !');
  };

  const clearCart = () => {
    setCart([]);
    localStorage.removeItem('cart');
    toast.success('Panier vidé !');
  };

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0).toFixed(2);
  };

  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCustomerInfo(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    const required = ['nom', 'prenom', 'telephone', 'email', 'adresse', 'ville'];
    for (let field of required) {
      if (!customerInfo[field].trim()) {
        toast.error(`Le champ ${field} est requis.`);
        return false;
      }
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(customerInfo.email)) {
      toast.error('Email invalide.');
      return false;
    }

    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(customerInfo.telephone.replace(/\s/g, ''))) {
      toast.error('Numéro de téléphone invalide (10 chiffres requis)');
      return false;
    }

    return true;
  };

  const generatePDF = () => {
    if (!validateForm()) return;

    try {
      const doc = new jsPDF();
      
      // Configuration
      const primaryColor = [0, 102, 204];
      const textColor = [0, 0, 0];
      const grayColor = [128, 128, 128];
      
      // En-tête
      doc.setFontSize(20);
      doc.setTextColor(...primaryColor);
      doc.text('FACTURE DE COMMANDE', 105, 20, null, null, 'center');
      
      // Informations commande
      doc.setFontSize(12);
      doc.setTextColor(...textColor);
      doc.text(`Date: ${new Date().toLocaleDateString('fr-FR')}`, 20, 35);
      doc.text(`Numéro: CMD-${Date.now().toString().slice(-8)}`, 20, 45);

      // Informations client
      doc.setFontSize(14);
      doc.setTextColor(...primaryColor);
      doc.text('INFORMATIONS CLIENT', 20, 65);
      doc.setFontSize(11);
      doc.setTextColor(...textColor);
      
      let yPos = 75;
      doc.text(`Nom: ${customerInfo.nom} ${customerInfo.prenom}`, 20, yPos);
      doc.text(`Téléphone: ${customerInfo.telephone}`, 20, yPos + 10);
      doc.text(`Email: ${customerInfo.email}`, 20, yPos + 20);
      doc.text(`Adresse: ${customerInfo.adresse}`, 20, yPos + 30);
      doc.text(`Ville: ${customerInfo.ville} ${customerInfo.codePostal}`, 20, yPos + 40);

      // Séparation
      doc.setDrawColor(...primaryColor);
      doc.line(20, yPos + 50, 190, yPos + 50);

      // Détails produits
      yPos += 65;
      doc.setFontSize(14);
      doc.setTextColor(...primaryColor);
      doc.text('DÉTAILS DE LA COMMANDE', 20, yPos);
      
      // En-têtes tableau
      yPos += 10;
      doc.setFontSize(10);
      doc.setTextColor(...textColor);
      doc.text('Produit', 20, yPos);
      doc.text('Qté', 120, yPos);
      doc.text('Prix Unit.', 140, yPos);
      doc.text('Total', 170, yPos);
      
      doc.line(20, yPos + 3, 190, yPos + 3);
      yPos += 10;
      
      // Produits
      cart.forEach((item) => {
        const itemTotal = (parseFloat(item.price) * item.quantity);
        doc.text(item.name.substring(0, 35), 20, yPos);
        doc.text(item.quantity.toString(), 120, yPos);
        doc.text(`${parseFloat(item.price).toFixed(2)} DH`, 140, yPos);
        doc.text(`${itemTotal.toFixed(2)} DH`, 170, yPos);
        yPos += 8;
      });

      // Total
      doc.line(140, yPos, 190, yPos);
      yPos += 10;
      doc.setFontSize(12);
      doc.setFont(undefined, 'bold');
      doc.text(`TOTAL: ${getTotalPrice()} DH`, 160, yPos, null, null, 'right');

      // Pied de page
      yPos += 20;
      doc.setFontSize(10);
      doc.setFont(undefined, 'normal');
      doc.setTextColor(...grayColor);
      doc.text('Merci pour votre commande !', 105, yPos, null, null, 'center');
      doc.text(`Nombre total d'articles: ${getTotalItems()}`, 105, yPos + 10, null, null, 'center');

      // Téléchargement
      doc.save(`commande-${Date.now()}.pdf`);
      
      toast.success('PDF généré avec succès !');
      clearCart();
      setShowOrderForm(false);
      setCustomerInfo({
        nom: '',
        prenom: '',
        telephone: '',
        email: '',
        adresse: '',
        ville: '',
        codePostal: ''
      });

    } catch (error) {
      console.error('Erreur lors de la génération du PDF:', error);
      toast.error('Erreur lors de la génération du PDF');
    }
  };

  if (cart.length === 0) {
    return (
      <div className="container py-4">
        <ToastContainer />
        <div className="text-center">
          <h2 className="text-primary mb-4">Votre Panier</h2>
          <div className="alert alert-info">
            <i className="fas fa-shopping-cart fa-3x mb-3"></i>
            <h4>Votre panier est vide</h4>
            <p>Ajoutez des produits pour commencer vos achats.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <ToastContainer />
      <h2 className="text-primary mb-4">Votre Panier ({getTotalItems()} articles)</h2>

      {!showOrderForm ? (
        <>
          <div className="row">
            {cart.map((item) => (
              <div key={item._id} className="col-12 mb-3">
                <div className="card">
                  <div className="card-body">
                    <div className="row align-items-center">
                      <div className="col-md-2">
                        {item.images?.[0] && (
                          <img
                            src={`${item.images[0].startsWith('http') ? '' : 'http://localhost:5002'}${item.images[0]}`}
                            className="img-fluid rounded"
                            alt={item.name}
                            style={{ maxHeight: '80px', objectFit: 'cover' }}
                          />
                        )}
                      </div>
                      <div className="col-md-4">
                        <h5 className="card-title">{item.name}</h5>
                        <p className="text-muted">{item.category}</p>
                      </div>
                      <div className="col-md-2">
                        <p className="mb-0"><strong>{parseFloat(item.price).toFixed(2)} DH</strong></p>
                      </div>
                      <div className="col-md-2">
                        <div className="input-group">
                          <button 
                            className="btn btn-outline-secondary btn-sm"
                            onClick={() => updateQuantity(item._id, item.quantity - 1)}
                          >
                            -
                          </button>
                          <input
                            type="number"
                            className="form-control text-center"
                            value={item.quantity}
                            onChange={(e) => updateQuantity(item._id, parseInt(e.target.value) || 1)}
                            min="1"
                            max={item.stockQuantity || 100}
                            style={{ maxWidth: '60px' }}
                          />
                          <button 
                            className="btn btn-outline-secondary btn-sm"
                            onClick={() => updateQuantity(item._id, item.quantity + 1)}
                            disabled={item.quantity >= (item.stockQuantity || 100)}
                          >
                            +
                          </button>
                        </div>
                      </div>
                      <div className="col-md-1">
                        <p className="mb-0"><strong>{(parseFloat(item.price) * item.quantity).toFixed(2)} DH</strong></p>
                      </div>
                      <div className="col-md-1 text-end">
                        <button
                          className="btn btn-outline-danger btn-sm"
                          onClick={() => removeFromCart(item._id)}
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="row mt-4">
            <div className="col-md-8"></div>
            <div className="col-md-4">
              <div className="card">
                <div className="card-body">
                  <h5>Résumé de la commande</h5>
                  <hr />
                  <div className="d-flex justify-content-between">
                    <span>Articles ({getTotalItems()})</span>
                    <span>{getTotalPrice()} DH</span>
                  </div>
                  <hr />
                  <div className="d-flex justify-content-between">
                    <strong>Total</strong>
                    <strong className="text-success">{getTotalPrice()} DH</strong>
                  </div>
                  <div className="mt-3 d-grid gap-2">
                    <button 
                      className="btn btn-primary"
                      onClick={() => setShowOrderForm(true)}
                    >
                      Confirmer la commande
                    </button>
                    <button 
                      className="btn btn-outline-danger"
                      onClick={clearCart}
                    >
                      Vider le panier
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="row justify-content-center">
          <div className="col-md-8">
            <div className="card">
              <div className="card-header">
                <h4>Informations de livraison</h4>
              </div>
              <div className="card-body">
                <form>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Nom *</label>
                      <input
                        type="text"
                        className="form-control"
                        name="nom"
                        value={customerInfo.nom}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Prénom *</label>
                      <input
                        type="text"
                        className="form-control"
                        name="prenom"
                        value={customerInfo.prenom}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Téléphone *</label>
                      <input
                        type="tel"
                        className="form-control"
                        name="telephone"
                        value={customerInfo.telephone}
                        onChange={handleInputChange}
                        required
                        pattern="[0-9]{10}"
                        title="10 chiffres requis"
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Email *</label>
                      <input
                        type="email"
                        className="form-control"
                        name="email"
                        value={customerInfo.email}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Adresse *</label>
                    <input
                      type="text"
                      className="form-control"
                      name="adresse"
                      value={customerInfo.adresse}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="row">
                    <div className="col-md-8 mb-3">
                      <label className="form-label">Ville *</label>
                      <input
                        type="text"
                        className="form-control"
                        name="ville"
                        value={customerInfo.ville}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="col-md-4 mb-3">
                      <label className="form-label">Code Postal</label>
                      <input
                        type="text"
                        className="form-control"
                        name="codePostal"
                        value={customerInfo.codePostal}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                </form>

                <div className="mt-4">
                  <h5>Résumé de votre commande</h5>
                  <div className="border p-3">
                    {cart.map((item) => (
                      <div key={item._id} className="d-flex justify-content-between mb-2">
                        <span>{item.name} x {item.quantity}</span>
                        <span>{(parseFloat(item.price) * item.quantity).toFixed(2)} DH</span>
                      </div>
                    ))}
                    <hr />
                    <div className="d-flex justify-content-between">
                      <strong>Total: {getTotalPrice()} DH</strong>
                    </div>
                  </div>
                </div>

                <div className="mt-3 d-flex gap-2">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowOrderForm(false)}
                  >
                    Retour au panier
                  </button>
                  <button
                    type="button"
                    className="btn btn-success"
                    onClick={generatePDF}
                  >
                    Générer la facture PDF
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartPage;