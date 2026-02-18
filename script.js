// =================================
// Configuration & Global Variables
// =================================

const CONFIG = {
  TYPING_SPEED: 80,
  TYPING_DELAY: 1500,
  SCROLL_THRESHOLD: 0.1,
  ANIMATION_DELAY: 100
};

let currentSection = 'home';

// =================================
// Utility Functions
// =================================

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);

const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

const throttle = (func, limit) => {
  let inThrottle;
  return function() {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  }
};

// =================================
// Smooth Scroll
// =================================

class SmoothScroll {
  constructor() {
    this.init();
  }

  init() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', (e) => {
        const href = anchor.getAttribute('href');
        if (href === '#' || href === '#home') return;
        
        const target = document.querySelector(href);
        if (target) {
          e.preventDefault();
          const offsetTop = target.offsetTop - 80;
          window.scrollTo({
            top: offsetTop,
            behavior: 'smooth'
          });
        }
      });
    });
  }
}

// =================================
// Navigation Manager
// =================================

class NavigationManager {
  constructor() {
    this.init();
  }

  init() {
    this.updateActiveSection();
    window.addEventListener('scroll', throttle(() => {
      this.updateActiveSection();
    }, 100));
  }

  updateActiveSection() {
    const sections = document.querySelectorAll('div[id]');
    let current = 'home';
    
    sections.forEach(section => {
      const sectionTop = section.offsetTop - 150;
      const sectionHeight = section.clientHeight;
      
      if (window.pageYOffset >= sectionTop && 
          window.pageYOffset < sectionTop + sectionHeight) {
        current = section.getAttribute('id');
      }
    });
    
    currentSection = current;
    this.highlightActiveLink();
  }

  highlightActiveLink() {
    document.querySelectorAll('nav a').forEach(link => {
      link.classList.remove('active');
      const href = link.getAttribute('href');
      if (href === `#${currentSection}`) {
        link.classList.add('active');
      }
    });
  }
}

// =================================
// Contact Form Handler
// =================================

class ContactForm {
  constructor() {
    this.form = $('#contactForm') || document.querySelector('.contact-form');
    this.submitBtn = document.querySelector('.btn-submit');
    this.init();
  }

  init() {
    if (this.form) {
      // Inicializar EmailJS
      emailjs.init({
        publicKey: 'ByMPPfAn0bfDKTVdj',
      });

      this.form.addEventListener('submit', (e) => this.handleSubmit(e));
    }
  }

  async handleSubmit(e) {
    e.preventDefault();

    // Obtener datos del formulario
    const formData = {
      from_name: document.getElementById('name')?.value || '',
      from_email: document.getElementById('email')?.value || '',
      phone: document.getElementById('phone')?.value || '',
      subject: document.getElementById('subject')?.value || '',
      message: document.getElementById('message')?.value || ''
    };

    // Validar campos
    if (!formData.from_name || !formData.from_email || !formData.message) {
      this.showNotification('Error', 'Por favor completa los campos requeridos', 'error');
      return;
    }

    // Cambiar estado del botón
    this.setSubmitState('loading');

    try {
      // Enviar correo
      await emailjs.send('service_fua9hla', 'template_82u4nbg', formData);
      
      this.setSubmitState('success');
      this.form.reset();
      this.showNotification('¡Éxito!', 'Tu mensaje ha sido enviado correctamente', 'success');
      
      // Resetear botón después de 3 segundos
      setTimeout(() => this.resetSubmitButton(), 3000);
    } catch (error) {
      console.error('Error email:', error);
      this.setSubmitState('error');
      this.showNotification('Error', 'No se pudo enviar el mensaje. Intenta más tarde', 'error');
      setTimeout(() => this.resetSubmitButton(), 3000);
    }
  }

  setSubmitState(state) {
    const btnText = this.submitBtn.textContent;

    switch (state) {
      case 'loading':
        this.submitBtn.disabled = true;
        this.submitBtn.textContent = 'Enviando...';
        this.submitBtn.style.opacity = '0.7';
        break;
      case 'success':
        this.submitBtn.textContent = '¡Enviado!';
        this.submitBtn.style.background = '#00a651';
        break;
      case 'error':
        this.submitBtn.textContent = 'Error al enviar';
        this.submitBtn.style.background = '#ff4444';
        break;
    }
  }

  resetSubmitButton() {
    this.submitBtn.disabled = false;
    this.submitBtn.textContent = 'Enviar Mensaje';
    this.submitBtn.style.opacity = '1';
    this.submitBtn.style.background = '';
  }

  showNotification(title, message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${type === 'success' ? '#00a651' : '#ff4444'};
      color: white;
      padding: 15px 25px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      z-index: 10000;
      animation: slideInRight 0.3s ease;
      font-weight: 600;
    `;

    const content = document.createElement('div');
    content.innerHTML = `<strong>${title}:</strong> ${message}`;
    notification.appendChild(content);

    document.body.appendChild(notification);

    setTimeout(() => {
      notification.style.animation = 'slideOutRight 0.3s ease forwards';
      setTimeout(() => notification.remove(), 300);
    }, 4000);
  }
}

// =================================
// Scroll Animations
// =================================

class ScrollAnimations {
  constructor() {
    this.observeElements();
  }

  observeElements() {
    const options = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
          }, index * CONFIG.ANIMATION_DELAY);
        }
      });
    }, options);

    const elementsToObserve = [
      '.subtitle',
      '.project-card',
      '.contact-form',
      '.cv-content'
    ];

    elementsToObserve.forEach(selector => {
      document.querySelectorAll(selector).forEach(element => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(20px)';
        element.style.transition = 'all 0.6s ease';
        observer.observe(element);
      });
    });
  }
}

// =================================
// Additional CSS Animations
// =================================

const additionalStyles = `
  @keyframes slideInRight {
    from { transform: translateX(100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
  
  @keyframes slideOutRight {
    from { transform: translateX(0); opacity: 1; }
    to { transform: translateX(100%); opacity: 0; }
  }

  nav a.active {
    color: var(--secondary-color);
    font-weight: 600;
  }
`;

const styleSheet = document.createElement('style');
styleSheet.textContent = additionalStyles;
document.head.appendChild(styleSheet);

// =================================
// Initialize Application
// =================================

document.addEventListener('DOMContentLoaded', () => {
  new SmoothScroll();
  new NavigationManager();
  new ScrollAnimations();
  new ContactForm();
  
  console.log('%c✨ Portfolio cargado exitosamente ✨', 'color: #0000ff; font-size: 16px; font-weight: bold;');
});

// =================================
// Error Handling
// =================================

window.addEventListener('error', (e) => {
  console.error('Error:', e.error);
});
