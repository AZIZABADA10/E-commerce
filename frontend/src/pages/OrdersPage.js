import { useEffect, useState } from 'react';
import { getOrders, getProducts, updateOrder, deleteOrder } from '../api/api';
import { ToastContainer, toast } from 'react-toastify';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'react-toastify/dist/ReactToastify.css';

function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [ordersRes, productsRes] = await Promise.all([
          getOrders(),
          getProducts()
        ]);
        setOrders(ordersRes.data);
        setProducts(productsRes.data);
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
        toast.error('Erreur lors du chargement des données');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const getProductName = (id) => {
    const product = products.find(p => p._id === id);
    return product ? product.name : 'Produit inconnu';
  };

  const getProductPrice = (id) => {
    const product = products.find(p => p._id === id);
    return product ? product.price : 0;
  };

  const handleCancel = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir annuler cette commande?')) {
      try {
        await deleteOrder(id);
        toast.success('Commande annulée avec succès.');
        setOrders(orders.filter(order => order._id !== id));
      } catch (err) {
        console.error('Erreur lors de l\'annulation de la commande:', err);
        toast.error('Erreur lors de l\'annulation de la commande');
      }
    }
  };

  const handleUpdate = async (id) => {
    const currentOrder = orders.find(order => order._id === id);
    const newQuantity = prompt('Entrez la nouvelle quantité :', currentOrder.quantity);
    
    if (!newQuantity || isNaN(newQuantity) || newQuantity <= 0) {
      toast.warning('Veuillez entrer une quantité valide');
      return;
    }

    try {
      const updatedOrder = await updateOrder(id, { quantity: parseInt(newQuantity) });
      setOrders(orders.map(order => (order._id === id ? updatedOrder.data : order)));
      toast.success('Commande mise à jour avec succès.');
    } catch (err) {
      console.error('Erreur lors de la mise à jour de la commande:', err);
      toast.error('Erreur lors de la mise à jour de la commande');
    }
  };

  const getStatusBadge = (status) => {
    const statusClasses = {
      'pending': 'bg-warning text-dark',
      'completed': 'bg-success',
      'cancelled': 'bg-danger',
      'processing': 'bg-info',
      'en attente': 'bg-warning text-dark'
    };
    
    const statusText = {
      'pending': 'En attente',
      'completed': 'Terminée',
      'cancelled': 'Annulée',
      'processing': 'En cours',
      'en attente': 'En attente'
    };
    
    return {
      class: statusClasses[status?.toLowerCase()] || 'bg-secondary',
      text: statusText[status?.toLowerCase()] || status
    };
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const calculateOrderTotal = (order) => {
    const productPrice = getProductPrice(order.productId);
    return (productPrice * order.quantity).toFixed(2);
  };

  if (loading) {
    return (
      <div className="container py-4 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Chargement...</span>
        </div>
        <p className="mt-2">Chargement des commandes...</p>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <ToastContainer />
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="text-primary">Gestion des Commandes</h2>
        <div className="badge bg-info fs-6">
          {orders.length} commande{orders.length !== 1 ? 's' : ''}
        </div>
      </div>
      
      {orders.length === 0 ? (
        <div className="text-center py-5">
          <i className="fas fa-clipboard-list fa-4x text-muted mb-3"></i>
          <h4 className="text-muted">Aucune commande disponible</h4>
          <p className="text-muted">Les commandes apparaîtront ici une fois créées.</p>
        </div>
      ) : (
        <div className="row">
          {orders.map(order => (
            <div key={order._id} className="col-md-6 col-lg-4 mb-4">
              <div className="card shadow-sm h-100">
                <div className="card-header d-flex justify-content-between align-items-center">
                  <h6 className="card-title mb-0">
                    <i className="fas fa-shopping-bag me-2 text-primary"></i>
                    Commande #{order._id.slice(-6)}
                  </h6>
                  <span className={`badge ${getStatusBadge(order.status).class}`}>
                    {getStatusBadge(order.status).text}
                  </span>
                </div>
                <div className="card-body">
                  <div className="mb-2">
                    <strong className="text-primary">Produit :</strong>
                    <p className="mb-1">{getProductName(order.productId)}</p>
                  </div>
                  
                  <div className="row mb-2">
                    <div className="col-6">
                      <strong className="text-primary">Quantité :</strong>
                      <p className="mb-1">{order.quantity}</p>
                    </div>
                    <div className="col-6">
                      <strong className="text-primary">Prix unitaire :</strong>
                      <p className="mb-1">{getProductPrice(order.productId)} DH</p>
                    </div>
                  </div>

                  <div className="mb-2">
                    <strong className="text-success">Total : {calculateOrderTotal(order)} DH</strong>
                  </div>

                  {order.createdAt && (
                    <div className="mb-2">
                      <small className="text-muted">
                        <i className="fas fa-calendar me-1"></i>
                        Créée le {formatDate(order.createdAt)}
                      </small>
                    </div>
                  )}

                  {order.updatedAt && order.updatedAt !== order.createdAt && (
                    <div className="mb-2">
                      <small className="text-muted">
                        <i className="fas fa-edit me-1"></i>
                        Modifiée le {formatDate(order.updatedAt)}
                      </small>
                    </div>
                  )}
                </div>
                <div className="card-footer bg-transparent">
                  <div className="d-flex justify-content-between gap-2">
                    <button 
                      onClick={() => handleUpdate(order._id)} 
                      className="btn btn-outline-primary btn-sm flex-fill"
                      disabled={order.status === 'cancelled' || order.status === 'completed'}
                    >
                      <i className="fas fa-edit me-1"></i>
                      Modifier
                    </button>
                    <button 
                      onClick={() => handleCancel(order._id)} 
                      className="btn btn-outline-danger btn-sm flex-fill"
                      disabled={order.status === 'cancelled' || order.status === 'completed'}
                    >
                      <i className="fas fa-times me-1"></i>
                      Annuler
                    </button>
                  </div>
                  {(order.status === 'cancelled' || order.status === 'completed') && (
                    <small className="text-muted d-block text-center mt-2">
                      Cette commande ne peut plus être modifiée
                    </small>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Statistiques rapides */}
      {orders.length > 0 && (
        <div className="row mt-4">
          <div className="col-12">
            <div className="card bg-light">
              <div className="card-body">
                <h5 className="card-title text-primary">
                  <i className="fas fa-chart-bar me-2"></i>
                  Statistiques rapides
                </h5>
                <div className="row text-center">
                  <div className="col-md-3">
                    <div className="border-end">
                      <h4 className="text-warning">
                        {orders.filter(o => o.status === 'pending' || o.status === 'en attente').length}
                      </h4>
                      <small className="text-muted">En attente</small>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="border-end">
                      <h4 className="text-info">
                        {orders.filter(o => o.status === 'processing').length}
                      </h4>
                      <small className="text-muted">En cours</small>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="border-end">
                      <h4 className="text-success">
                        {orders.filter(o => o.status === 'completed').length}
                      </h4>
                      <small className="text-muted">Terminées</small>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <h4 className="text-danger">
                      {orders.filter(o => o.status === 'cancelled').length}
                    </h4>
                    <small className="text-muted">Annulées</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default OrdersPage;