// ============================================
// LB-K SMART 2026 - MAIN APPLICATION CONTROLLER
// ============================================

// Configuration globale de l'application
const LBK_CONFIG = {
    APP_NAME: "LB-K SMART 2026",
    VERSION: "2026.1.0",
    CURRENCY: "FCFA",
    WHATSAPP_NUMBERS: {
        LAURENT: "+243822937321",
        BETTY: "+243971455335"
    },
    CATEGORIES: [
        "pharmacie", "habillement", "electronique",
        "electromenager", "cosmetiques", "auto-pieces"
    ]
};

// État global de l'application
const AppState = {
    currentView: 'bureau',
    cartItems: [],
    products: [],
    stock: [],
    userPreferences: {
        mode: 'desktop',
        currency: 'FCFA',
        language: 'fr'
    }
};

// ============================================
// FONCTIONS D'INITIALISATION PRINCIPALES
// ============================================

/**
 * Initialise l'application complète
 */
function initializeApplication() {
    console.log(`🚀 ${LBK_CONFIG.APP_NAME} v${LBK_CONFIG.VERSION}`);
    
    // 1. Initialiser les préférences utilisateur
    loadUserPreferences();
    
    // 2. Initialiser le gestionnaire de mode
    initializeModeManager();
    
    // 3. Initialiser la navigation
    initializeNavigation();
    
    // 4. Initialiser les composants UI
    initializeUIComponents();
    
    // 5. Charger les données initiales
    loadInitialData();
    
    // 6. Initialiser les écouteurs d'événements globaux
    initializeGlobalEventListeners();
    
    // 7. Mettre à jour l'interface
    updateUI();
    
    // 8. Afficher notification de bienvenue
    showWelcomeNotification();
}

/**
 * Initialise le gestionnaire de mode Desktop/Mobile
 */
function initializeModeManager() {
    const modeSwitcher = document.querySelector('.mode-switcher');
    if (!modeSwitcher) return;
    
    // Restaurer le mode sauvegardé ou détecter
    const savedMode = localStorage.getItem('lbk_mode') || detectPreferredMode();
    setMode(savedMode);
    
    // Ajouter les écouteurs d'événements
    document.querySelectorAll('.mode-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const mode = this.dataset.mode;
            setMode(mode);
            saveUserPreference('mode', mode);
        });
    });
    
    // Détection automatique au redimensionnement
    window.addEventListener('resize', handleResizeModeDetection);
}

/**
 * Définit le mode d'affichage
 */
function setMode(mode) {
    // Mettre à jour le body
    document.body.classList.remove('desktop-mode', 'mobile-mode');
    document.body.classList.add(`${mode}-mode`);
    
    // Mettre à jour les boutons
    document.querySelectorAll('.mode-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.mode === mode);
    });
    
    // Mettre à jour l'indicateur
    const modeIndicator = document.querySelector('.mode-indicator');
    if (modeIndicator) {
        modeIndicator.querySelector('.mode-icon').textContent = 
            mode === 'desktop' ? '🖥️' : '📱';
        modeIndicator.querySelector('.mode-text').textContent = 
            mode === 'desktop' ? 'Mode Bureau' : 'Mode Mobile';
    }
    
    // Sauvegarder
    AppState.userPreferences.mode = mode;
    localStorage.setItem('lbk_mode', mode);
    
    // Émettre un événement
    dispatchEvent(new CustomEvent('modeChanged', { detail: { mode } }));
}

/**
 * Détecte le mode préféré selon la taille d'écran
 */
function detectPreferredMode() {
    const isMobile = window.innerWidth <= 768 || 
                    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    return isMobile ? 'mobile' : 'desktop';
}

/**
 * Gère la détection de mode au redimensionnement
 */
function handleResizeModeDetection() {
    const currentMode = AppState.userPreferences.mode;
    const detectedMode = detectPreferredMode();
    
    if (currentMode !== detectedMode) {
        // Option: demander confirmation ou changer automatiquement
        if (confirm(`Passer en mode ${detectedMode === 'desktop' ? 'Bureau' : 'Mobile'} ?`)) {
            setMode(detectedMode);
        }
    }
}

/**
 * Initialise le système de navigation
 */
function initializeNavigation() {
    const navButtons = document.querySelectorAll('.nav-btn');
    
    navButtons.forEach(button => {
        button.addEventListener('click', function() {
            const sectionId = this.dataset.section;
            
            // Mettre à jour les boutons actifs
            navButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            // Afficher la section correspondante
            showSection(sectionId);
            
            // Mettre à jour l'état
            AppState.currentView = sectionId;
            saveUserPreference('lastView', sectionId);
        });
    });
    
    // Restaurer la dernière vue visitée
    const lastView = localStorage.getItem('lbk_lastView') || 'bureau';
    document.querySelector(`.nav-btn[data-section="${lastView}"]`)?.click();
}

/**
 * Affiche une section spécifique
 */
function showSection(sectionId) {
    // Cacher toutes les sections
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Afficher la section demandée
    const targetSection = document.getElementById(`${sectionId}Section`);
    if (targetSection) {
        targetSection.classList.add('active');
        
        // Initialiser le contenu spécifique à la section
        initializeSectionContent(sectionId);
    }
}

/**
 * Initialise le contenu d'une section spécifique
 */
function initializeSectionContent(sectionId) {
    switch(sectionId) {
        case 'bureau':
            initializeBureau();
            break;
        case 'catalogue':
            initializeCatalogue();
            break;
        case 'panier':
            initializePanier();
            break;
        case 'admin':
            initializeAdmin();
            break;
        case 'terminal':
            initializeTerminal();
            break;
    }
}

/**
 * Initialise les composants UI globaux
 */
function initializeUIComponents() {
    // Initialiser le panier flottant
    initializeFloatingCart();
    
    // Initialiser l'assistant IA
    initializeAIAssistant();
    
    // Initialiser les notifications
    initializeNotifications();
    
    // Initialiser les modals
    initializeModals();
    
    // Initialiser la barre de statut
    initializeStatusBar();
}

/**
 * Charge les données initiales
 */
async function loadInitialData() {
    try {
        // Charger les produits
        await loadProducts();
        
        // Charger le stock
        await loadStock();
        
        // Charger le panier
        loadCartFromStorage();
        
        // Mettre à jour les compteurs
        updateAllCounters();
        
    } catch (error) {
        console.error('Erreur chargement données:', error);
        showNotification('Erreur de chargement des données', 'error');
    }
}

/**
 * Charge les produits depuis le stockage local
 */
async function loadProducts() {
    // Pour l'instant, on utilise des données de démo
    // Plus tard, cela peut venir d'un fichier JSON ou d'une API
    
    AppState.products = [
        {
            id: 1,
            name: "Paracétamol 500mg",
            category: "pharmacie",
            price: 1500,
            image: "assets/images/placeholder.jpg",
            stock: 45,
            type: "stock"
        },
        {
            id: 2,
            name: "T-Shirt Homme",
            category: "habillement",
            price: 7500,
            image: "assets/images/placeholder.jpg",
            stock: 0,
            type: "order"
        },
        {
            id: 3,
            name: "Smartphone Android",
            category: "electronique",
            price: 250000,
            image: "assets/images/placeholder.jpg",
            stock: 12,
            type: "stock"
        }
    ];
    
    console.log(`${AppState.products.length} produits chargés`);
}

/**
 * Charge le stock disponible
 */
async function loadStock() {
    // Filtrer les produits en stock
    AppState.stock = AppState.products.filter(product => product.stock > 0);
}

/**
 * Initialise le panier flottant
 */
function initializeFloatingCart() {
    const cartIcon = document.querySelector('.floating-cart .cart-icon');
    const cartPreview = document.querySelector('.cart-preview');
    
    if (!cartIcon || !cartPreview) return;
    
    // Basculer l'affichage du panier
    cartIcon.addEventListener('click', function() {
        cartPreview.style.display = cartPreview.style.display === 'block' ? 'none' : 'block';
        updateCartPreview();
    });
    
    // Fermer le panier
    document.querySelector('.close-preview-btn')?.addEventListener('click', function() {
        cartPreview.style.display = 'none';
    });
    
    // Bouton commander sur WhatsApp
    document.querySelector('.preview-checkout-btn')?.addEventListener('click', function() {
        checkoutViaWhatsApp();
    });
}

/**
 * Met à jour l'aperçu du panier
 */
function updateCartPreview() {
    const previewItems = document.querySelector('.preview-items');
    const cartBadge = document.querySelector('.cart-badge');
    const totalAmount = document.querySelector('.total-amount');
    
    if (!previewItems) return;
    
    if (AppState.cartItems.length === 0) {
        previewItems.innerHTML = '<p class="empty-cart-message">Votre panier est vide</p>';
        if (cartBadge) cartBadge.textContent = '0';
        if (totalAmount) totalAmount.textContent = '0 FCFA';
        return;
    }
    
    // Calculer le total
    let total = 0;
    
    // Générer le HTML des articles
    previewItems.innerHTML = AppState.cartItems.map(item => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        
        return `
            <div class="preview-item">
                <div class="preview-item-info">
                    <strong>${item.name}</strong>
                    <span>${item.quantity} × ${formatPrice(item.price)} FCFA</span>
                </div>
                <div class="preview-item-total">${formatPrice(itemTotal)} FCFA</div>
            </div>
        `;
    }).join('');
    
    // Mettre à jour le badge et le total
    if (cartBadge) cartBadge.textContent = AppState.cartItems.length.toString();
    if (totalAmount) totalAmount.textContent = `${formatPrice(total)} FCFA`;
}

/**
 * Ajoute un produit au panier
 */
function addToCart(productId, quantity = 1) {
    const product = AppState.products.find(p => p.id === productId);
    if (!product) return;
    
    // Vérifier si le produit est déjà dans le panier
    const existingItem = AppState.cartItems.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        AppState.cartItems.push({
            ...product,
            quantity: quantity,
            addedAt: new Date().toISOString()
        });
    }
    
    // Sauvegarder
    saveCartToStorage();
    
    // Mettre à jour l'UI
    updateCartPreview();
    updateAllCounters();
    
    // Afficher notification
    showNotification(`${product.name} ajouté au panier`, 'success');
    
    // Émettre un événement
    dispatchEvent(new CustomEvent('cartUpdated', { 
        detail: { items: AppState.cartItems } 
    }));
}

/**
 * Passe à la commande via WhatsApp
 */
function checkoutViaWhatsApp() {
    if (AppState.cartItems.length === 0) {
        showNotification('Votre panier est vide', 'error');
        return;
    }
    
    // Construire le message
    let message = `*NOUVELLE COMMANDE - LB-K SMART 2026*\n\n`;
    message += `Date: ${new Date().toLocaleString('fr-FR')}\n`;
    message += `Client: À renseigner\n`;
    message += `Téléphone: À renseigner\n\n`;
    message += `*DÉTAIL DE LA COMMANDE:*\n`;
    
    let total = 0;
    AppState.cartItems.forEach((item, index) => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        message += `${index + 1}. ${item.name} - ${item.quantity} × ${formatPrice(item.price)} = ${formatPrice(itemTotal)} FCFA\n`;
    });
    
    message += `\n*TOTAL: ${formatPrice(total)} FCFA*\n\n`;
    message += `Informations de livraison:\n`;
    message += `- Adresse: \n`;
    message += `- Ville: \n`;
    message += `- Contact: \n\n`;
    message += `_Cette commande a été générée automatiquement par LB-K SMART 2026_`;
    
    // Encoder le message pour URL
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${LBK_CONFIG.WHATSAPP_NUMBERS.LAURENT}?text=${encodedMessage}`;
    
    // Ouvrir WhatsApp
    window.open(whatsappUrl, '_blank');
    
    // Option: vider le panier après commande
    // AppState.cartItems = [];
    // saveCartToStorage();
    // updateCartPreview();
}

/**
 * Formate un prix avec séparateurs de milliers
 */
function formatPrice(price) {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

/**
 * Initialise le bureau principal
 */
function initializeBureau() {
    console.log('Initialisation du bureau...');
    
    // Charger les produits en stock
    const stockGrid = document.querySelector('.bureau-container');
    if (stockGrid) {
        // TODO: Implémenter l'affichage du bureau
    }
}

/**
 * Initialise le catalogue
 */
function initializeCatalogue() {
    console.log('Initialisation du catalogue...');
    
    const catalogueGrid = document.getElementById('catalogueGrid');
    if (!catalogueGrid) return;
    
    // Afficher les produits
    displayProductsInCatalogue();
    
    // Initialiser les filtres
    initializeCategoryFilters();
    
    // Initialiser la recherche
    initializeSearch();
}

/**
 * Affiche les produits dans le catalogue
 */
function displayProductsInCatalogue() {
    const catalogueGrid = document.getElementById('catalogueGrid');
    if (!catalogueGrid) return;
    
    catalogueGrid.innerHTML = AppState.products.map(product => `
        <div class="product-card" data-category="${product.category}" data-id="${product.id}">
            <div class="product-badge ${product.stock > 0 ? 'stock-badge' : 'order-badge'}">
                ${product.stock > 0 ? '🟢 EN STOCK' : '🟡 SUR COMMANDE'}
            </div>
            <div class="product-image">
                <img src="${product.image}" alt="${product.name}">
            </div>
            <div class="product-info">
                <h3>${product.name}</h3>
                <div class="product-category">${getCategoryIcon(product.category)} ${product.category}</div>
                <div class="product-price">${formatPrice(product.price)} FCFA</div>
                <div class="product-stock">${product.stock > 0 ? `${product.stock} disponibles` : 'Livraison 15-21 jours'}</div>
            </div>
            <div class="product-actions">
                <button class="btn-add-to-cart" onclick="addToCart(${product.id}, 1)">
                    <i class="fas fa-cart-plus"></i> Ajouter
                </button>
                <button class="btn-view-details" onclick="showProductDetails(${product.id})">
                    <i class="fas fa-eye"></i> Détails
                </button>
            </div>
        </div>
    `).join('');
}

/**
 * Retourne l'icône d'une catégorie
 */
function getCategoryIcon(category) {
    const icons = {
        'pharmacie': '💊',
        'habillement': '👕',
        'electronique': '📱',
        'electromenager': '🏠',
        'cosmetiques': '💄',
        'auto-pieces': '🚗'
    };
    return icons[category] || '📦';
}

/**
 * Initialise les filtres par catégorie
 */
function initializeCategoryFilters() {
    document.querySelectorAll('.cat-filter').forEach(filter => {
        filter.addEventListener('click', function() {
            const category = this.dataset.category;
            
            // Mettre à jour les filtres actifs
            document.querySelectorAll('.cat-filter').forEach(f => f.classList.remove('active'));
            this.classList.add('active');
            
            // Filtrer les produits
            filterProductsByCategory(category);
        });
    });
}

/**
 * Filtre les produits par catégorie
 */
function filterProductsByCategory(category) {
    const allProducts = document.querySelectorAll('.product-card');
    
    allProducts.forEach(product => {
        if (category === 'all' || product.dataset.category === category) {
            product.style.display = 'block';
        } else {
            product.style.display = 'none';
        }
    });
}

/**
 * Initialise la recherche
 */
function initializeSearch() {
    const searchInput = document.querySelector('.search-input');
    const searchBtn = document.querySelector('.search-btn');
    
    if (!searchInput || !searchBtn) return;
    
    searchBtn.addEventListener('click', performSearch);
    searchInput.addEventListener('keyup', function(event) {
        if (event.key === 'Enter') performSearch();
    });
    
    function performSearch() {
        const query = searchInput.value.toLowerCase().trim();
        
        if (!query) {
            filterProductsByCategory('all');
            return;
        }
        
        const allProducts = document.querySelectorAll('.product-card');
        allProducts.forEach(product => {
            const productName = product.querySelector('h3').textContent.toLowerCase();
            const productCategory = product.dataset.category;
            
            if (productName.includes(query) || productCategory.includes(query)) {
                product.style.display = 'block';
            } else {
                product.style.display = 'none';
            }
        });
    }
}

/**
 * Initialise le panier
 */
function initializePanier() {
    console.log('Initialisation du panier...');
    updateCartPreview();
}

/**
 * Initialise l'administration
 */
function initializeAdmin() {
    console.log('Initialisation administration...');
    
    // Gestion de la connexion admin
    const adminLoginBtn = document.querySelector('.admin-login-btn');
    const adminPassword = document.querySelector('.admin-password');
    const adminPanel = document.getElementById('adminPanel');
    
    if (adminLoginBtn && adminPassword) {
        adminLoginBtn.addEventListener('click', function() {
            const password = adminPassword.value;
            
            // Mot de passe simple pour la démo
            if (password === 'LBKSMART2026') {
                adminPanel.style.display = 'block';
                showNotification('Accès admin autorisé', 'success');
            } else {
                showNotification('Mot de passe incorrect', 'error');
            }
        });
        
        // Entrée sur le champ password
        adminPassword.addEventListener('keyup', function(event) {
            if (event.key === 'Enter') {
                adminLoginBtn.click();
            }
        });
    }
}

/**
 * Initialise le terminal
 */
function initializeTerminal() {
    console.log('Initialisation terminal...');
    
    // Mettre à jour l'heure en temps réel
    updateTerminalTime();
    setInterval(updateTerminalTime, 1000);
    
    // Gestion des boutons du terminal
    initializeTerminalButtons();
}

/**
 * Met à jour l'heure dans le terminal
 */
function updateTerminalTime() {
    const timeElement = document.getElementById('currentTime');
    if (timeElement) {
        timeElement.textContent = new Date().toLocaleTimeString('fr-FR');
    }
}

/**
 * Initialise les boutons du terminal
 */
function initializeTerminalButtons() {
    // Bouton exécuter
    const runBtn = document.querySelector('.run-code-btn');
    if (runBtn) {
        runBtn.addEventListener('click', function() {
            const output = document.getElementById('terminalOutput');
            if (output) {
                output.innerHTML += `<div class="output-line">$ Exécution du code...</div>`;
                output.innerHTML += `<div class="output-line success">✓ Code exécuté avec succès</div>`;
                output.scrollTop = output.scrollHeight;
            }
        });
    }
    
    // Bouton effacer
    const clearBtn = document.querySelector('.clear-output-btn');
    if (clearBtn) {
        clearBtn.addEventListener('click', function() {
            const output = document.getElementById('terminalOutput');
            if (output) {
                output.innerHTML = `
                    <div class="output-line">$ Terminal LB-K SMART initialisé...</div>
                    <div class="output-line success">✓ Terminal prêt</div>
                    <div class="output-line">$ Version: ${LBK_CONFIG.VERSION}</div>
                    <div class="output-line">$ Heure: <span id="currentTime">${new Date().toLocaleTimeString('fr-FR')}</span></div>
                `;
            }
        });
    }
}

/**
 * Initialise l'assistant IA
 */
function initializeAIAssistant() {
    const aiAssistant = document.getElementById('aiAssistant');
    const aiCloseBtn = document.querySelector('.ai-close-btn');
    const aiSendBtn = document.querySelector('.ai-send-btn');
    const aiInput = document.querySelector('.ai-input input');
    
    if (!aiAssistant || !aiCloseBtn) return;
    
    // Basculer l'affichage de l'assistant
    document.querySelector('.help-btn')?.addEventListener('click', function() {
        aiAssistant.style.display = aiAssistant.style.display === 'block' ? 'none' : 'block';
    });
    
    // Fermer l'assistant
    aiCloseBtn.addEventListener('click', function() {
        aiAssistant.style.display = 'none';
    });
    
    // Envoyer un message
    if (aiSendBtn && aiInput) {
        aiSendBtn.addEventListener('click', sendAIMessage);
        aiInput.addEventListener('keyup', function(event) {
            if (event.key === 'Enter') sendAIMessage();
        });
    }
    
    // Actions rapides
    document.querySelectorAll('.quick-action').forEach(action => {
        action.addEventListener('click', function() {
            const actionType = this.dataset.action;
            handleAIAction(actionType);
        });
    });
}

/**
 * Gère les actions rapides de l'IA
 */
function handleAIAction(actionType) {
    const chat = document.querySelector('.ai-chat');
    if (!chat) return;
    
    let response = '';
    
    switch(actionType) {
        case 'product_recommend':
            response = "💡 **Recommandation** : D'après vos achats récents, je vous suggère de regarder nos nouveaux modèles de smartphones Android. Ils sont actuellement en promotion !";
            break;
        case 'stock_info':
            const stockCount = AppState.stock.length;
            response = `📊 **Information Stock** : Vous avez actuellement ${stockCount} produits différents en stock. ${stockCount > 10 ? 'Niveau de stock excellent !' : 'Pensez à réapprovisionner.'}`;
            break;
        case 'shipping_calc':
            response = "🚚 **Livraison** : Pour Kinshasa : 48h. Autres villes : 3-5 jours. International : 15-21 jours (aérien) ou 30-45 jours (maritime).";
            break;
        case 'order_help':
            response = "🛒 **Aide Commande** : 1. Ajoutez des produits au panier. 2. Cliquez sur 'Commander sur WhatsApp'. 3. Remplissez vos informations. 4. Confirmez avec notre équipe sur WhatsApp !";
            break;
        default:
            response = "Je suis là pour vous aider ! Que souhaitez-vous savoir ?";
    }
    
    chat.innerHTML += `
        <div class="ai-message user-message">
            <div class="message-content">Action: ${actionType.replace('_', ' ')}</div>
        </div>
        <div class="ai-message">
            <div class="message-content">${response}</div>
            <div class="message-time">À l'instant</div>
        </div>
    `;
    
    chat.scrollTop = chat.scrollHeight;
}

/**
 * Envoie un message à l'assistant IA
 */
function sendAIMessage() {
    const aiInput = document.querySelector('.ai-input input');
    const chat = document.querySelector('.ai-chat');
    
    if (!aiInput || !chat || !aiInput.value.trim()) return;
    
    const userMessage = aiInput.value;
    
    // Ajouter le message utilisateur
    chat.innerHTML += `
        <div class="ai-message user-message">
            <div class="message-content">${userMessage}</div>
        </div>
    `;
    
    // Réponse automatique (simulée)
    setTimeout(() => {
        const responses = [
            "Je comprends votre question. Pour le produit 'Paracétamol', nous avons 45 unités en stock.",
            "La livraison à Kinshasa prend généralement 48 heures. Pour les autres villes, comptez 3-5 jours ouvrés.",
            "Vous pouvez commander directement via WhatsApp en cliquant sur le bouton vert 'Commander sur WhatsApp'.",
            "Pour ajouter un produit au panier, cliquez simplement sur le bouton 'Ajouter' sous le produit.",
            "Notre équipe est disponible 24h/24 sur WhatsApp au +243 822 937 321 pour toute assistance."
        ];
        
        const randomResponse = responses[Math.floor(Math.random() * responses.length)];
        
        chat.innerHTML += `
            <div class="ai-message">
                <div class="message-content">${randomResponse}</div>
                <div class="message-time">À l'instant</div>
            </div>
        `;
        
        chat.scrollTop = chat.scrollHeight;
    }, 1000);
    
    // Effacer le champ
    aiInput.value = '';
}

/**
 * Initialise le système de notifications
 */
function initializeNotifications() {
    // La fonction showNotification est déjà définie
}

/**
 * Affiche une notification
 */
function showNotification(message, type = 'info') {
    const container = document.getElementById('notificationContainer');
    if (!container) return;
    
    const icons = {
        'success': '✅',
        'error': '❌',
        'info': 'ℹ️',
        'warning': '⚠️'
    };
    
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div class="notification-icon">${icons[type] || 'ℹ️'}</div>
        <div class="notification-content">${message}</div>
    `;
    
    container.appendChild(notification);
    
    // Supprimer après 5 secondes
    setTimeout(() => {
        notification.style.opacity = '0';
        setTimeout(() => notification.remove(), 300);
    }, 5000);
}

/**
 * Initialise les modals
 */
function initializeModals() {
    // Fermer les modals en cliquant sur l'overlay
    const modalOverlay = document.getElementById('modalOverlay');
    if (modalOverlay) {
        modalOverlay.addEventListener('click', function() {
            document.querySelectorAll('.modal').forEach(modal => {
                modal.style.display = 'none';
            });
            this.style.display = 'none';
        });
    }
    
    // Boutons de fermeture
    document.querySelectorAll('.modal-close-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            this.closest('.modal').style.display = 'none';
            if (modalOverlay) modalOverlay.style.display = 'none';
        });
    });
}

/**
 * Initialise la barre de statut
 */
function initializeStatusBar() {
    updateAllCounters();
    setInterval(updateAllCounters, 60000); // Mettre à jour toutes les minutes
}

/**
 * Met à jour tous les compteurs
 */
function updateAllCounters() {
    // Produits totaux
    const totalProducts = document.getElementById('totalProducts');
    if (totalProducts) {
        totalProducts.textContent = AppState.products.length;
    }
    
    // Produits en stock
    const stockCount = document.getElementById('stockCount');
    if (stockCount) {
        stockCount.textContent = AppState.stock.length;
    }
    
    // Articles dans le panier
    const orderCount = document.getElementById('orderCount');
    if (orderCount) {
        orderCount.textContent = AppState.cartItems.length;
    }
    
    // Valeur du stock (calcul simplifié)
    const revenueCount = document.getElementById('revenueCount');
    if (revenueCount) {
        const stockValue = AppState.stock.reduce((total, product) => {
            return total + (product.price * product.stock);
        }, 0);
        revenueCount.textContent = `${formatPrice(stockValue)} FCFA`;
    }
}

/**
 * Charge les préférences utilisateur
 */
function loadUserPreferences() {
    const savedMode = localStorage.getItem('lbk_mode');
    const savedCurrency = localStorage.getItem('lbk_currency');
    const savedLanguage = localStorage.getItem('lbk_language');
    
    if (savedMode) AppState.userPreferences.mode = savedMode;
    if (savedCurrency) AppState.userPreferences.currency = savedCurrency;
    if (savedLanguage) AppState.userPreferences.language = savedLanguage;
}

/**
 * Sauvegarde une préférence utilisateur
 */
function saveUserPreference(key, value) {
    AppState.userPreferences[key] = value;
    localStorage.setItem(`lbk_${key}`, value);
}

/**
 * Charge le panier depuis le stockage local
 */
function loadCartFromStorage() {
    const savedCart = localStorage.getItem('lbk_cart');
    if (savedCart) {
        try {
            AppState.cartItems = JSON.parse(savedCart);
            console.log(`${AppState.cartItems.length} articles chargés dans le panier`);
        } catch (e) {
            console.error('Erreur chargement panier:', e);
            AppState.cartItems = [];
        }
    }
}

/**
 * Sauvegarde le panier dans le stockage local
 */
function saveCartToStorage() {
    localStorage.setItem('lbk_cart', JSON.stringify(AppState.cartItems));
}

/**
 * Initialise les écouteurs d'événements globaux
 */
function initializeGlobalEventListeners() {
    // Mettre à jour l'heure dans le footer
    updateFooterDate();
    
    // Raccourcis clavier
    document.addEventListener('keydown', function(event) {
        // Ctrl+M pour basculer le mode
        if (event.ctrlKey && event.key === 'm') {
            event.preventDefault();
            const newMode = AppState.userPreferences.mode === 'desktop' ? 'mobile' : 'desktop';
            setMode(newMode);
        }
        
        // Échap pour fermer les modals
        if (event.key === 'Escape') {
            document.querySelectorAll('.modal').forEach(modal => {
                modal.style.display = 'none';
            });
            const modalOverlay = document.getElementById('modalOverlay');
            if (modalOverlay) modalOverlay.style.display = 'none';
        }
    });
    
    // Mettre à jour la date du footer
    function updateFooterDate() {
        const dateElement = document.getElementById('currentDate');
        if (dateElement) {
            dateElement.textContent = new Date().toLocaleDateString('fr-FR', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        }
    }
    
    // Mettre à jour l'UI
    function updateUI() {
        updateFooterDate();
        updateAllCounters();
    }
    
    // Afficher la notification de bienvenue
    function showWelcomeNotification() {
        setTimeout(() => {
            showNotification(`Bienvenue sur ${LBK_CONFIG.APP_NAME} ! 🚀`, 'success');
        }, 1000);
    }
}

/**
 * Affiche les détails d'un produit
 */
function showProductDetails(productId) {
    const product = AppState.products.find(p => p.id === productId);
    if (!product) return;
    
    const modal = document.getElementById('productModal');
    const modalContent = document.getElementById('modalProductContent');
    
    if (!modal || !modalContent) return;
    
    // Mettre à jour le titre
    document.getElementById('modalProductTitle').textContent = product.name;
    
    // Générer le contenu
    modalContent.innerHTML = `
        <div class="product-modal-content">
            <div class="product-modal-image">
                <img src="${product.image}" alt="${product.name}">
            </div>
            <div class="product-modal-details">
                <div class="detail-row">
                    <span class="detail-label">Catégorie:</span>
                    <span class="detail-value">${getCategoryIcon(product.category)} ${product.category}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Prix:</span>
                    <span class="detail-value price">${formatPrice(product.price)} FCFA</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Disponibilité:</span>
                    <span class="detail-value ${product.stock > 0 ? 'in-stock' : 'on-order'}">
                        ${product.stock > 0 ? `🟢 ${product.stock} unités en stock` : '🟡 Sur commande (15-21 jours)'}
                    </span>
                </div>
                <div class="product-modal-description">
                    <h4>Description</h4>
                    <p>Produit de qualité ${product.category}. Livraison garantie.</p>
                </div>
                <div class="product-modal-actions">
                    <button class="btn-add-to-cart-large" onclick="addToCart(${product.id}, 1); document.getElementById('productModal').style.display='none';">
                        <i class="fas fa-cart-plus"></i> Ajouter au panier
                    </button>
                    <button class="btn-whatsapp-inquiry" onclick="inquireViaWhatsApp(${product.id})">
                        <i class="fab fa-whatsapp"></i> Demander sur WhatsApp
                    </button>
                </div>
            </div>
        </div>
    `;
    
    // Afficher le modal
    modal.style.display = 'block';
    document.getElementById('modalOverlay').style.display = 'block';
}

/**
 * Demande d'information sur un produit via WhatsApp
 */
function inquireViaWhatsApp(productId) {
    const product = AppState.products.find(p => p.id === productId);
    if (!product) return;
    
    const message = `Bonjour, je suis intéressé par le produit : *${product.name}* (${formatPrice(product.price)} FCFA). Pourriez-vous me donner plus d'informations ?`;
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${LBK_CONFIG.WHATSAPP_NUMBERS.LAURENT}?text=${encodedMessage}`;
    
    window.open(whatsappUrl, '_blank');
}

// ============================================
// DÉMARRAGE DE L'APPLICATION
// ============================================

// Démarrer l'application quand le DOM est chargé
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApplication);
} else {
    initializeApplication();
}

// Exposer certaines fonctions globalement pour les appels depuis le HTML
window.addToCart = addToCart;
window.showProductDetails = showProductDetails;
window.checkoutViaWhatsApp = checkoutViaWhatsApp;
window.inquireViaWhatsApp = inquireViaWhatsApp;