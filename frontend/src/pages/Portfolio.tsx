import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import {
  Phone, Mail, MapPin, Clock, ChevronRight, ChevronLeft,
  Home, Wrench, Zap, Droplets, PaintBucket, CheckCircle2,
  Star, Building2, Users, Award, ArrowRight, Menu, X,
  ShoppingBag, Package, Truck, Shield, Globe
} from 'lucide-react';

// Language types
type Language = 'de' | 'fr' | 'en' | 'nl';

// Translations
const translations: Record<Language, {
  nav: { home: string; services: string; projects: string; products: string; process: string; reviews: string; contact: string; };
  hero: { badge: string; tagline: string; description: string; cta: string; viewProjects: string; projects: string; experience: string; satisfaction: string; };
  services: { title: string; subtitle: string; items: { title: string; description: string; features: string[]; }[]; };
  projects: { title: string; subtitle: string; };
  products: { title: string; subtitle: string; cta: string; features: { title: string; description: string; }[]; categories: { name: string; description: string; }[]; };
  process: { title: string; subtitle: string; steps: { title: string; description: string; }[]; };
  testimonials: { title: string; subtitle: string; };
  contact: { title: string; subtitle: string; form: { name: string; phone: string; email: string; projectType: string; message: string; submit: string; response: string; select: string; types: string[]; }; phone: string; email: string; location: string; hours: string; badges: string[]; };
  footer: { services: string; contact: string; rights: string; seoText: string; };
  seo: { title: string; description: string; keywords: string; };
}> = {
  de: {
    nav: { home: 'Startseite', services: 'Dienstleistungen', projects: 'Projekte', products: 'Produkte', process: 'Arbeitsweise', reviews: 'Bewertungen', contact: 'Kontakt' },
    hero: {
      badge: 'Bauunternehmer in Gent & Umgebung',
      tagline: 'Wo Tradition auf Innovation trifft',
      description: 'Ihr zuverlässiger Partner für alle Bau- und Renovierungsarbeiten in Gent und Umgebung. Von Fundament bis Fertigstellung sorgen wir für Qualität.',
      cta: 'Kostenloses Angebot anfordern',
      viewProjects: 'Unsere Projekte ansehen',
      projects: 'Projekte',
      experience: 'Jahre Erfahrung',
      satisfaction: 'Zufriedenheit'
    },
    services: {
      title: 'Unsere Dienstleistungen',
      subtitle: 'Vom Fundament bis zur Fertigstellung - wir betreuen Ihr komplettes Bauprojekt mit Handwerkskunst und Präzision.',
      items: [
        { title: 'Neubau', description: 'Komplette Neubauprojekte von A bis Z. Wir bauen Ihr Traumhaus mit Liebe zum Detail und Nachhaltigkeit.', features: ['Schlüsselfertig', 'Energieeffizient', 'Moderne Architektur'] },
        { title: 'Renovierung', description: 'Vollständige Renovierung von Häusern und Wohnungen. Von kleinen Anpassungen bis hin zu Komplettrenovierungen.', features: ['Badezimmer', 'Küche', 'Dacharbeiten'] },
        { title: 'Elektrik', description: 'Professionelle Elektroinstallationen nach AREI-Normen. Sicherheit und Qualität garantiert.', features: ['Komplettinstallation', 'Smart Home', 'Prüfungsfertig'] },
        { title: 'Sanitär', description: 'Sanitärinstallationen und Klempnerarbeiten. Von der Leitung bis zur Fertigstellung, alles aus einer Hand.', features: ['Leitungen', 'Heizung', 'Regenwassernutzung'] },
        { title: 'Innenausbau', description: 'Professionelle Fertigstellung für ein perfektes Ergebnis. Malerarbeiten, Böden und mehr.', features: ['Malerarbeiten', 'Bodenarbeiten', 'Trockenbau'] },
        { title: 'Rohbau', description: 'Solide Rohbauarbeiten als Fundament für jedes Projekt. Erfahrene Maurer und Betonarbeiter.', features: ['Mauerwerk', 'Betonarbeiten', 'Fundamente'] }
      ]
    },
    projects: { title: 'Unsere Projekte', subtitle: 'Sehen Sie sich unsere realisierten Projekte an und entdecken Sie die Qualität unserer Arbeit.' },
    products: {
      title: 'Baumaterialien & Produkte',
      subtitle: 'Hochwertige Baumaterialien direkt vom Fachmann. Wir liefern und beraten Sie kompetent.',
      cta: 'Produkt anfragen',
      features: [
        { title: 'Qualitätsprodukte', description: 'Nur geprüfte Materialien von führenden Herstellern' },
        { title: 'Schnelle Lieferung', description: 'Lieferung innerhalb von 24-48 Stunden in der Region Gent' },
        { title: 'Fachberatung', description: 'Kompetente Beratung durch erfahrene Handwerker' },
        { title: 'Garantie', description: 'Herstellergarantie auf alle Produkte' }
      ],
      categories: [
        { name: 'Elektromaterial', description: 'Kabel, Schalter, Steckdosen, Sicherungen' },
        { name: 'Sanitärbedarf', description: 'Rohre, Armaturen, Sanitärkeramik' },
        { name: 'Baustoffe', description: 'Zement, Mörtel, Ziegel, Isolierung' },
        { name: 'Werkzeuge', description: 'Professionelle Werkzeuge für Heimwerker' }
      ]
    },
    process: {
      title: 'Unsere Arbeitsweise',
      subtitle: 'Vom Erstkontakt bis zur Schlüsselübergabe: ein klarer und transparenter Prozess.',
      steps: [
        { title: 'Kennenlernen & Angebot', description: 'Kostenloser Vor-Ort-Termin und detailliertes Angebot' },
        { title: 'Planung & Genehmigungen', description: 'Vollständige Begleitung bei Verwaltung und Planung' },
        { title: 'Rohbau', description: 'Fundamente, Mauern, Dach - die Basis Ihres Projekts' },
        { title: 'Technik', description: 'Elektrik, Sanitär, Heizung fachgerecht installiert' },
        { title: 'Innenausbau', description: 'Böden, Wände, Malerarbeiten - bis ins Detail' },
        { title: 'Übergabe', description: 'Qualitätskontrolle und zufriedene Kunden' }
      ]
    },
    testimonials: { title: 'Kundenbewertungen', subtitle: 'Zufriedene Kunden sind unsere beste Werbung.' },
    contact: {
      title: 'Kontakt aufnehmen',
      subtitle: 'Bereit, Ihr Projekt zu besprechen? Kontaktieren Sie uns noch heute für ein kostenloses und unverbindliches Angebot.',
      form: {
        name: 'Name *',
        phone: 'Telefon *',
        email: 'E-Mail *',
        projectType: 'Projektart',
        message: 'Nachricht *',
        submit: 'Anfrage senden',
        response: 'Wir antworten innerhalb von 24 Stunden an Werktagen.',
        select: 'Auswählen...',
        types: ['Renovierung', 'Neubau', 'Elektrik', 'Sanitär', 'Produkte kaufen', 'Sonstiges']
      },
      phone: 'Telefon',
      email: 'E-Mail',
      location: 'Standort',
      hours: 'Öffnungszeiten',
      badges: ['Anerkannter Bauunternehmer']
    },
    footer: {
      services: 'Dienstleistungen',
      contact: 'Kontakt',
      rights: 'Alle Rechte vorbehalten.',
      seoText: 'Bauunternehmer in Gent | Renovierung | Neubau | Ostflandern'
    },
    seo: {
      title: 'L&E Bouw Gent | Renovierung & Neubau Spezialist | Bauunternehmer Ostflandern',
      description: 'L&E Bouw - Ihr zuverlässiger Bauunternehmer in Gent für Renovierung, Neubau und alle Bauarbeiten. Handwerkskunst, Qualität und persönlicher Service. Jetzt kostenloses Angebot!',
      keywords: 'bauunternehmer gent, renovierung gent, neubau gent, baufirma ostflandern, umbau gent, elektriker gent, sanitär gent, dacharbeiten gent, baumaterialien gent'
    }
  },
  fr: {
    nav: { home: 'Accueil', services: 'Services', projects: 'Projets', products: 'Produits', process: 'Méthode', reviews: 'Avis', contact: 'Contact' },
    hero: {
      badge: 'Entrepreneur à Gand & Environs',
      tagline: 'L\'Excellence au Service de Vos Projets',
      description: 'Votre partenaire fiable pour tous les travaux de construction et rénovation à Gand et environs. De la fondation à la finition, nous garantissons la qualité.',
      cta: 'Demander un devis gratuit',
      viewProjects: 'Voir nos projets',
      projects: 'Projets',
      experience: 'Ans d\'expérience',
      satisfaction: 'Satisfaction'
    },
    services: {
      title: 'Nos Services',
      subtitle: 'De la fondation à la finition - nous gérons votre projet de construction complet avec artisanat et précision.',
      items: [
        { title: 'Construction Neuve', description: 'Projets de construction neufs complets de A à Z. Nous construisons votre maison de rêve avec souci du détail.', features: ['Clé en main', 'Économe en énergie', 'Architecture moderne'] },
        { title: 'Rénovation', description: 'Rénovation complète de maisons et appartements. Des petits ajustements aux rénovations totales.', features: ['Salle de bain', 'Cuisine', 'Toiture'] },
        { title: 'Électricité', description: 'Installations électriques professionnelles selon les normes AREI. Sécurité et qualité garanties.', features: ['Installation complète', 'Domotique', 'Prêt pour contrôle'] },
        { title: 'Sanitaire', description: 'Installations sanitaires et plomberie. De la tuyauterie à la finition, tout en une seule main.', features: ['Tuyauterie', 'Chauffage', 'Récupération eau de pluie'] },
        { title: 'Finitions', description: 'Finitions professionnelles pour un résultat parfait. Peinture, sols et plus.', features: ['Peinture', 'Revêtements de sol', 'Plâtrerie'] },
        { title: 'Gros Œuvre', description: 'Travaux de gros œuvre solides comme fondation de chaque projet. Maçons et bétonneurs expérimentés.', features: ['Maçonnerie', 'Béton', 'Fondations'] }
      ]
    },
    projects: { title: 'Nos Projets', subtitle: 'Découvrez nos projets réalisés et la qualité de notre travail.' },
    products: {
      title: 'Matériaux de Construction & Produits',
      subtitle: 'Matériaux de construction de qualité directement du professionnel. Nous livrons et vous conseillons.',
      cta: 'Demander un produit',
      features: [
        { title: 'Produits de Qualité', description: 'Uniquement des matériaux testés de fabricants leaders' },
        { title: 'Livraison Rapide', description: 'Livraison sous 24-48h dans la région de Gand' },
        { title: 'Conseil Expert', description: 'Conseils compétents par des artisans expérimentés' },
        { title: 'Garantie', description: 'Garantie fabricant sur tous les produits' }
      ],
      categories: [
        { name: 'Matériel Électrique', description: 'Câbles, interrupteurs, prises, fusibles' },
        { name: 'Sanitaire', description: 'Tuyaux, robinetterie, céramique sanitaire' },
        { name: 'Matériaux de Construction', description: 'Ciment, mortier, briques, isolation' },
        { name: 'Outils', description: 'Outils professionnels pour bricoleurs' }
      ]
    },
    process: {
      title: 'Notre Méthode de Travail',
      subtitle: 'Du premier contact à la remise des clés: un processus clair et transparent.',
      steps: [
        { title: 'Rencontre & Devis', description: 'Visite gratuite sur place et devis détaillé' },
        { title: 'Planification & Permis', description: 'Accompagnement complet pour l\'administration et la planification' },
        { title: 'Gros Œuvre', description: 'Fondations, murs, toit - la base de votre projet' },
        { title: 'Techniques', description: 'Électricité, sanitaire, chauffage installés professionnellement' },
        { title: 'Finitions', description: 'Sols, murs, peinture - jusqu\'au moindre détail' },
        { title: 'Livraison', description: 'Contrôle qualité et clients satisfaits' }
      ]
    },
    testimonials: { title: 'Avis Clients', subtitle: 'Les clients satisfaits sont notre meilleure publicité.' },
    contact: {
      title: 'Contactez-nous',
      subtitle: 'Prêt à discuter de votre projet? Contactez-nous aujourd\'hui pour un devis gratuit et sans engagement.',
      form: {
        name: 'Nom *',
        phone: 'Téléphone *',
        email: 'E-mail *',
        projectType: 'Type de projet',
        message: 'Message *',
        submit: 'Envoyer la demande',
        response: 'Nous répondons sous 24 heures les jours ouvrables.',
        select: 'Sélectionner...',
        types: ['Rénovation', 'Construction neuve', 'Électricité', 'Sanitaire', 'Acheter des produits', 'Autre']
      },
      phone: 'Téléphone',
      email: 'E-mail',
      location: 'Localisation',
      hours: 'Heures d\'ouverture',
      badges: ['Entrepreneur Agréé']
    },
    footer: {
      services: 'Services',
      contact: 'Contact',
      rights: 'Tous droits réservés.',
      seoText: 'Entrepreneur à Gand | Rénovation | Construction Neuve | Flandre Orientale'
    },
    seo: {
      title: 'L&E Bouw Gand | Spécialiste Rénovation & Construction | Entrepreneur Flandre Orientale',
      description: 'L&E Bouw - Votre entrepreneur fiable à Gand pour rénovation, construction neuve et tous travaux. Artisanat, qualité et service personnalisé. Devis gratuit!',
      keywords: 'entrepreneur gand, rénovation gand, construction neuve gand, entreprise construction flandre orientale, électricien gand, sanitaire gand, matériaux construction gand'
    }
  },
  en: {
    nav: { home: 'Home', services: 'Services', projects: 'Projects', products: 'Products', process: 'Process', reviews: 'Reviews', contact: 'Contact' },
    hero: {
      badge: 'Contractor in Ghent & Surroundings',
      tagline: 'Building Dreams, Crafting Excellence',
      description: 'Your reliable partner for all construction and renovation work in Ghent and surroundings. From foundation to finish, we ensure quality.',
      cta: 'Request Free Quote',
      viewProjects: 'View Our Projects',
      projects: 'Projects',
      experience: 'Years Experience',
      satisfaction: 'Satisfaction'
    },
    services: {
      title: 'Our Services',
      subtitle: 'From foundation to finish - we handle your complete construction project with craftsmanship and precision.',
      items: [
        { title: 'New Construction', description: 'Complete new construction projects from A to Z. We build your dream home with attention to detail and sustainability.', features: ['Turnkey', 'Energy Efficient', 'Modern Architecture'] },
        { title: 'Renovation', description: 'Complete renovation of houses and apartments. From small adjustments to total renovations.', features: ['Bathroom', 'Kitchen', 'Roofing'] },
        { title: 'Electrical', description: 'Professional electrical installations according to AREI standards. Safety and quality guaranteed.', features: ['Full Installation', 'Smart Home', 'Inspection Ready'] },
        { title: 'Plumbing', description: 'Plumbing installations and plumbing work. From pipes to finishing, all from one hand.', features: ['Piping', 'Heating', 'Rainwater Recovery'] },
        { title: 'Finishing', description: 'Professional finishing for a perfect result. Painting, floors and more.', features: ['Painting', 'Flooring', 'Drywall'] },
        { title: 'Shell Construction', description: 'Solid shell construction as foundation for every project. Experienced masons and concrete workers.', features: ['Masonry', 'Concrete Work', 'Foundations'] }
      ]
    },
    projects: { title: 'Our Projects', subtitle: 'View our completed projects and discover the quality of our work.' },
    products: {
      title: 'Building Materials & Products',
      subtitle: 'High-quality building materials directly from the professional. We deliver and advise you competently.',
      cta: 'Request Product',
      features: [
        { title: 'Quality Products', description: 'Only tested materials from leading manufacturers' },
        { title: 'Fast Delivery', description: 'Delivery within 24-48 hours in the Ghent region' },
        { title: 'Expert Advice', description: 'Competent advice from experienced craftsmen' },
        { title: 'Warranty', description: 'Manufacturer warranty on all products' }
      ],
      categories: [
        { name: 'Electrical Materials', description: 'Cables, switches, outlets, fuses' },
        { name: 'Plumbing Supplies', description: 'Pipes, fittings, sanitary ceramics' },
        { name: 'Building Materials', description: 'Cement, mortar, bricks, insulation' },
        { name: 'Tools', description: 'Professional tools for DIY enthusiasts' }
      ]
    },
    process: {
      title: 'Our Working Method',
      subtitle: 'From first contact to key handover: a clear and transparent process.',
      steps: [
        { title: 'Introduction & Quote', description: 'Free on-site visit and detailed quote' },
        { title: 'Planning & Permits', description: 'Complete guidance with administration and planning' },
        { title: 'Shell Construction', description: 'Foundations, walls, roof - the basis of your project' },
        { title: 'Technical', description: 'Electrical, plumbing, heating professionally installed' },
        { title: 'Finishing', description: 'Floors, walls, painting - down to the details' },
        { title: 'Handover', description: 'Quality control and satisfied customers' }
      ]
    },
    testimonials: { title: 'Customer Reviews', subtitle: 'Satisfied customers are our best advertisement.' },
    contact: {
      title: 'Get in Touch',
      subtitle: 'Ready to discuss your project? Contact us today for a free, no-obligation quote.',
      form: {
        name: 'Name *',
        phone: 'Phone *',
        email: 'Email *',
        projectType: 'Project Type',
        message: 'Message *',
        submit: 'Send Request',
        response: 'We respond within 24 hours on business days.',
        select: 'Select...',
        types: ['Renovation', 'New Construction', 'Electrical', 'Plumbing', 'Buy Products', 'Other']
      },
      phone: 'Phone',
      email: 'Email',
      location: 'Location',
      hours: 'Business Hours',
      badges: ['Certified Contractor']
    },
    footer: {
      services: 'Services',
      contact: 'Contact',
      rights: 'All rights reserved.',
      seoText: 'Contractor in Ghent | Renovation | New Construction | East Flanders'
    },
    seo: {
      title: 'L&E Bouw Ghent | Renovation & Construction Specialist | Contractor East Flanders',
      description: 'L&E Bouw - Your reliable contractor in Ghent for renovation, new construction and all construction work. Craftsmanship, quality and personal service. Free quote!',
      keywords: 'contractor ghent, renovation ghent, new construction ghent, construction company east flanders, electrician ghent, plumbing ghent, building materials ghent'
    }
  },
  nl: {
    nav: { home: 'Home', services: 'Diensten', projects: 'Projecten', products: 'Producten', process: 'Werkwijze', reviews: 'Reviews', contact: 'Contact' },
    hero: {
      badge: 'Aannemer in Gent & Omgeving',
      tagline: 'Uw Droom, Ons Vakmanschap',
      description: 'Uw betrouwbare partner voor alle bouw- en renovatiewerken in Gent en omgeving. Van fundering tot afwerking, wij zorgen voor kwaliteit.',
      cta: 'Gratis Offerte Aanvragen',
      viewProjects: 'Bekijk Onze Projecten',
      projects: 'Projecten',
      experience: 'Jaar Ervaring',
      satisfaction: 'Tevredenheid'
    },
    services: {
      title: 'Onze Diensten',
      subtitle: 'Van fundering tot afwerking - wij verzorgen uw complete bouwproject met vakmanschap en precisie.',
      items: [
        { title: 'Nieuwbouw', description: 'Complete nieuwbouwprojecten van A tot Z. Wij bouwen uw droomwoning met oog voor detail en duurzaamheid.', features: ['Sleutel-op-de-deur', 'Energiezuinig bouwen', 'Moderne architectuur'] },
        { title: 'Renovatie', description: 'Volledige renovatie van woningen en appartementen. Van kleine aanpassingen tot totaalrenovaties.', features: ['Badkamerrenovatie', 'Keukenrenovatie', 'Dakwerken'] },
        { title: 'Elektriciteit', description: 'Professionele elektrische installaties volgens de AREI-normen. Veiligheid en kwaliteit gegarandeerd.', features: ['Volledige installatie', 'Domotica', 'Keuringsklaar'] },
        { title: 'Sanitair', description: 'Sanitaire installaties en loodgieterswerk. Van leiding tot afwerking, alles uit één hand.', features: ['Leidingwerk', 'Verwarmingsinstallatie', 'Regenwaterrecuperatie'] },
        { title: 'Afwerking', description: 'Professionele afwerkingen voor een perfect resultaat. Schilderwerk, vloeren en meer.', features: ['Schilderwerken', 'Vloerwerken', 'Gyproc & Pleisterwerk'] },
        { title: 'Ruwbouw', description: 'Solide ruwbouwwerken als fundament voor elk project. Ervaren metselaars en betonwerkers.', features: ['Metselwerk', 'Betonwerk', 'Funderingen'] }
      ]
    },
    projects: { title: 'Onze Projecten', subtitle: 'Bekijk onze gerealiseerde projecten en ontdek de kwaliteit van ons werk.' },
    products: {
      title: 'Bouwmaterialen & Producten',
      subtitle: 'Hoogwaardige bouwmaterialen rechtstreeks van de vakman. Wij leveren en adviseren u deskundig.',
      cta: 'Product aanvragen',
      features: [
        { title: 'Kwaliteitsproducten', description: 'Alleen geteste materialen van toonaangevende fabrikanten' },
        { title: 'Snelle Levering', description: 'Levering binnen 24-48 uur in de regio Gent' },
        { title: 'Vakadvies', description: 'Deskundig advies door ervaren vakmensen' },
        { title: 'Garantie', description: 'Fabrieksgarantie op alle producten' }
      ],
      categories: [
        { name: 'Elektrisch Materiaal', description: 'Kabels, schakelaars, stopcontacten, zekeringen' },
        { name: 'Sanitair', description: 'Buizen, kranen, sanitair keramiek' },
        { name: 'Bouwmaterialen', description: 'Cement, mortel, bakstenen, isolatie' },
        { name: 'Gereedschap', description: 'Professioneel gereedschap voor doe-het-zelvers' }
      ]
    },
    process: {
      title: 'Onze Werkwijze',
      subtitle: 'Van eerste contact tot sleuteloverdracht: een helder en transparant proces.',
      steps: [
        { title: 'Kennismaking & Offerte', description: 'Gratis plaatsbezoek en gedetailleerde offerte op maat' },
        { title: 'Planning & Vergunningen', description: 'Volledige begeleiding bij administratie en planning' },
        { title: 'Ruwbouw', description: 'Funderingen, muren, dak - de basis van uw project' },
        { title: 'Technieken', description: 'Elektriciteit, sanitair, verwarming vakkundig geïnstalleerd' },
        { title: 'Afwerking', description: 'Vloeren, muren, schilderwerk - tot in de puntjes' },
        { title: 'Oplevering', description: 'Kwaliteitscontrole en tevreden klanten' }
      ]
    },
    testimonials: { title: 'Wat Klanten Zeggen', subtitle: 'Tevreden klanten zijn onze beste reclame.' },
    contact: {
      title: 'Neem Contact Op',
      subtitle: 'Klaar om uw project te bespreken? Neem vandaag nog contact op voor een gratis en vrijblijvende offerte.',
      form: {
        name: 'Naam *',
        phone: 'Telefoon *',
        email: 'E-mail *',
        projectType: 'Type Project',
        message: 'Bericht *',
        submit: 'Verstuur Aanvraag',
        response: 'Wij reageren binnen 24 uur op werkdagen.',
        select: 'Selecteer...',
        types: ['Renovatie', 'Nieuwbouw', 'Elektriciteit', 'Sanitair', 'Producten kopen', 'Anders']
      },
      phone: 'Telefoon',
      email: 'E-mail',
      location: 'Locatie',
      hours: 'Openingsuren',
      badges: ['Erkend Aannemer']
    },
    footer: {
      services: 'Diensten',
      contact: 'Contact',
      rights: 'Alle rechten voorbehouden.',
      seoText: 'Aannemer in Gent | Renovatie | Nieuwbouw | Oost-Vlaanderen'
    },
    seo: {
      title: 'L&E Bouw Gent | Renovatie & Nieuwbouw Specialist | Aannemer Oost-Vlaanderen',
      description: 'L&E Bouw - Uw betrouwbare aannemer in Gent voor renovatie, nieuwbouw en alle bouwwerken. Vakmanschap, kwaliteit en persoonlijke service. Vraag gratis offerte!',
      keywords: 'aannemer gent, renovatie gent, nieuwbouw gent, bouwbedrijf oost-vlaanderen, verbouwing gent, elektricien gent, sanitair gent, bouwmaterialen gent'
    }
  }
};

// Language flags and names
const languages: { code: Language; name: string; flag: string }[] = [
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'nl', name: 'Nederlands', flag: '🇧🇪' }
];

// Company Information
const companyInfo = {
  name: 'L&E Bouw',
  phone: '465282668',
  phoneFormatted: '+32 465 28 26 68',
  email: 'nelicakani2@gmail.com',
  address: 'Gent, België',
  hours: 'Mo-Fr: 7:00 - 18:00',
  projectsCompleted: '150+',
  yearsExperience: '10+'
};

// Sample completed projects
const completedProjects = [
  {
    id: 1,
    title: { de: 'Villa Renovierung Mariakerke', fr: 'Rénovation Villa Mariakerke', en: 'Villa Renovation Mariakerke', nl: 'Villa Renovatie Mariakerke' },
    category: { de: 'Renovierung', fr: 'Rénovation', en: 'Renovation', nl: 'Renovatie' },
    location: 'Mariakerke, Gent',
    duration: { de: '6 Monate', fr: '6 mois', en: '6 months', nl: '6 maanden' },
    images: [
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800',
      'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800',
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800'
    ],
    features: { de: ['Komplettrenovierung', 'Neue Elektrik', 'Moderne Küche'], fr: ['Rénovation complète', 'Nouvelle électricité', 'Cuisine moderne'], en: ['Complete renovation', 'New electrical', 'Modern kitchen'], nl: ['Volledige renovatie', 'Nieuwe elektriciteit', 'Moderne keuken'] }
  },
  {
    id: 2,
    title: { de: 'Neubau Wohnung Drongen', fr: 'Construction Neuve Drongen', en: 'New Build Drongen', nl: 'Nieuwbouw Woning Drongen' },
    category: { de: 'Neubau', fr: 'Construction Neuve', en: 'New Construction', nl: 'Nieuwbouw' },
    location: 'Drongen, Gent',
    duration: { de: '12 Monate', fr: '12 mois', en: '12 months', nl: '12 maanden' },
    images: [
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800',
      'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800',
      'https://images.unsplash.com/photo-1600573472550-8090b5e0745e?w=800'
    ],
    features: { de: ['BEN-Haus', 'Solaranlagen', 'Wärmepumpe'], fr: ['Maison BEN', 'Panneaux solaires', 'Pompe à chaleur'], en: ['BEN home', 'Solar panels', 'Heat pump'], nl: ['BEN-woning', 'Zonnepanelen', 'Warmtepomp'] }
  },
  {
    id: 3,
    title: { de: 'Wohnungsrenovierung Zentrum', fr: 'Rénovation Appartement Centre', en: 'Apartment Renovation Center', nl: 'Appartementsrenovatie Centrum' },
    category: { de: 'Renovierung', fr: 'Rénovation', en: 'Renovation', nl: 'Renovatie' },
    location: 'Gent Centrum',
    duration: { de: '3 Monate', fr: '3 mois', en: '3 months', nl: '3 maanden' },
    images: [
      'https://images.unsplash.com/photo-1600607687644-c7171b42498f?w=800',
      'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=800',
      'https://images.unsplash.com/photo-1600585154363-67eb9e2e2099?w=800'
    ],
    features: { de: ['Authentische Elemente', 'Offene Küche', 'Neues Bad'], fr: ['Éléments authentiques', 'Cuisine ouverte', 'Nouvelle salle de bain'], en: ['Authentic elements', 'Open kitchen', 'New bathroom'], nl: ['Authentieke elementen', 'Open keuken', 'Nieuwe badkamer'] }
  }
];

// Testimonials
const testimonials = [
  { name: 'Jan De Smedt', location: 'Gent', rating: 5, text: { de: 'Ausgezeichneter Service von Anfang bis Ende. Unsere Renovierung wurde perfekt ausgeführt, im Budget und pünktlich. Sehr zufrieden!', fr: 'Service excellent du début à la fin. Notre rénovation a été parfaitement exécutée, dans le budget et à temps.', en: 'Excellent service from start to finish. Our renovation was perfectly executed, within budget and on time.', nl: 'Uitstekende service van begin tot eind. Onze renovatie werd perfect uitgevoerd, binnen budget en op tijd.' }, project: { de: 'Komplettrenovierung', fr: 'Rénovation complète', en: 'Complete renovation', nl: 'Volledige renovatie' } },
  { name: 'Marie Janssens', location: 'Mariakerke', rating: 5, text: { de: 'Professionelles Team, das wirklich auf den Kunden hört. Die Qualität der Arbeit ist einfach top. Empfehlenswert!', fr: 'Équipe professionnelle qui écoute vraiment le client. La qualité du travail est tout simplement top.', en: 'Professional team that really listens to the customer. The quality of work is simply top.', nl: 'Professioneel team dat echt naar de klant luistert. De kwaliteit van het werk is gewoon top.' }, project: { de: 'Neubau', fr: 'Construction neuve', en: 'New construction', nl: 'Nieuwbouw' } },
  { name: 'Peter Vermeersch', location: 'Drongen', rating: 5, text: { de: 'Vom Angebot bis zur Übergabe war alles klar und transparent. Keine Überraschungen, nur Qualität.', fr: 'Du devis à la livraison, tout était clair et transparent. Pas de surprises, que de la qualité.', en: 'From quote to delivery, everything was clear and transparent. No surprises, just quality.', nl: 'Van offerte tot oplevering was alles duidelijk en transparant. Geen verrassingen, alleen kwaliteit.' }, project: { de: 'Badezimmerrenovierung', fr: 'Rénovation salle de bain', en: 'Bathroom renovation', nl: 'Badkamerrenovatie' } }
];

// Service icons
const serviceIcons = [Home, Wrench, Zap, Droplets, PaintBucket, Building2];

const Portfolio: React.FC = () => {
  const [lang, setLang] = useState<Language>('nl'); // Dutch as default
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [activeProject, setActiveProject] = useState(0);
  const [activeImage, setActiveImage] = useState(0);

  // Contact form state
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    projectType: '',
    message: ''
  });
  const [formStatus, setFormStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [formError, setFormError] = useState('');

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormStatus('sending');
    setFormError('');

    try {
      const response = await fetch('http://localhost:3001/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setFormStatus('success');
        setFormData({ name: '', phone: '', email: '', projectType: '', message: '' });
      } else {
        const data = await response.json();
        setFormError(data.error || 'Er is een fout opgetreden');
        setFormStatus('error');
      }
    } catch (error) {
      setFormError('Kan geen verbinding maken met de server');
      setFormStatus('error');
    }
  };

  const t = translations[lang];

  // Auto-rotate project images
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveImage((prev) =>
        (prev + 1) % (completedProjects[activeProject]?.images.length || 1)
      );
    }, 4000);
    return () => clearInterval(timer);
  }, [activeProject]);

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setMobileMenuOpen(false);
  };

  const currentLang = languages.find(l => l.code === lang)!;

  return (
    <>
      {/* SEO Meta Tags */}
      <Helmet>
        <html lang={lang} />
        <title>{t.seo.title}</title>
        <meta name="description" content={t.seo.description} />
        <meta name="keywords" content={t.seo.keywords} />
        <meta name="robots" content="index, follow" />
        <meta name="geo.region" content="BE-VOV" />
        <meta name="geo.placename" content="Gent" />
        <meta property="og:title" content={t.seo.title} />
        <meta property="og:description" content={t.seo.description} />
        <meta property="og:type" content="website" />
        <meta property="og:locale" content={lang === 'nl' ? 'nl_BE' : lang === 'de' ? 'de_DE' : lang === 'fr' ? 'fr_BE' : 'en_US'} />
        <link rel="canonical" href={`https://lebouw.be/portfolio?lang=${lang}`} />
        <link rel="alternate" hrefLang="de" href="https://lebouw.be/portfolio?lang=de" />
        <link rel="alternate" hrefLang="fr" href="https://lebouw.be/portfolio?lang=fr" />
        <link rel="alternate" hrefLang="en" href="https://lebouw.be/portfolio?lang=en" />
        <link rel="alternate" hrefLang="nl" href="https://lebouw.be/portfolio?lang=nl" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "HomeAndConstructionBusiness",
            "name": "L&E Bouw",
            "description": t.seo.description,
            "address": {
              "@type": "PostalAddress",
              "addressLocality": "Gent",
              "addressRegion": "Oost-Vlaanderen",
              "addressCountry": "BE"
            },
            "telephone": companyInfo.phone,
            "email": companyInfo.email,
            "openingHours": "Mo-Fr 07:00-18:00",
            "priceRange": "€€",
            "areaServed": ["Gent", "Oost-Vlaanderen", "België"],
            "hasOfferCatalog": {
              "@type": "OfferCatalog",
              "name": "Bouwmaterialen",
              "itemListElement": [
                { "@type": "Offer", "itemOffered": { "@type": "Product", "name": "Elektrisch Materiaal" }},
                { "@type": "Offer", "itemOffered": { "@type": "Product", "name": "Sanitair" }},
                { "@type": "Offer", "itemOffered": { "@type": "Product", "name": "Bouwmaterialen" }}
              ]
            }
          })}
        </script>
      </Helmet>

      <div className="min-h-screen bg-white">
        {/* Navigation */}
        <nav className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-sm shadow-sm z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-14 sm:h-16">
              {/* Logo */}
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-amber-500 to-amber-600 rounded-lg flex items-center justify-center">
                  <Building2 className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <div>
                  <span className="text-lg sm:text-xl font-bold text-gray-900">L&E Bouw</span>
                  <span className="hidden sm:block text-xs text-gray-500">Gent</span>
                </div>
              </div>

              {/* Desktop Navigation */}
              <div className="hidden lg:flex items-center gap-6">
                <button onClick={() => scrollToSection('home')} className="text-sm text-gray-600 hover:text-amber-600 transition-colors">{t.nav.home}</button>
                <button onClick={() => scrollToSection('services')} className="text-sm text-gray-600 hover:text-amber-600 transition-colors">{t.nav.services}</button>
                <button onClick={() => scrollToSection('projects')} className="text-sm text-gray-600 hover:text-amber-600 transition-colors">{t.nav.projects}</button>
                <button onClick={() => scrollToSection('products')} className="text-sm text-gray-600 hover:text-amber-600 transition-colors">{t.nav.products}</button>
                <button onClick={() => scrollToSection('process')} className="text-sm text-gray-600 hover:text-amber-600 transition-colors">{t.nav.process}</button>
                <button onClick={() => scrollToSection('testimonials')} className="text-sm text-gray-600 hover:text-amber-600 transition-colors">{t.nav.reviews}</button>

                {/* Language Selector */}
                <div className="relative">
                  <button
                    onClick={() => setLangMenuOpen(!langMenuOpen)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 hover:text-amber-600 border border-gray-200 rounded-lg transition-colors"
                  >
                    <span className="text-base">{currentLang.flag}</span>
                    <span className="hidden xl:inline">{currentLang.code.toUpperCase()}</span>
                    <ChevronRight className={`w-4 h-4 transition-transform ${langMenuOpen ? 'rotate-90' : ''}`} />
                  </button>
                  {langMenuOpen && (
                    <div className="absolute right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg py-1 min-w-[140px]">
                      {languages.map((language) => (
                        <button
                          key={language.code}
                          onClick={() => { setLang(language.code); setLangMenuOpen(false); }}
                          className={`w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-amber-50 transition-colors ${lang === language.code ? 'bg-amber-50 text-amber-600' : 'text-gray-700'}`}
                        >
                          <span>{language.flag}</span>
                          <span>{language.name}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <button
                  onClick={() => scrollToSection('contact')}
                  className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors"
                >
                  {t.nav.contact}
                </button>
              </div>

              {/* Mobile: Language + Menu */}
              <div className="flex lg:hidden items-center gap-2">
                {/* Mobile Language Selector */}
                <div className="relative">
                  <button
                    onClick={() => setLangMenuOpen(!langMenuOpen)}
                    className="flex items-center gap-1 px-2 py-1.5 text-gray-600 border border-gray-200 rounded-lg"
                  >
                    <span>{currentLang.flag}</span>
                  </button>
                  {langMenuOpen && (
                    <div className="absolute right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg py-1 min-w-[130px] z-50">
                      {languages.map((language) => (
                        <button
                          key={language.code}
                          onClick={() => { setLang(language.code); setLangMenuOpen(false); }}
                          className={`w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-amber-50 ${lang === language.code ? 'bg-amber-50 text-amber-600' : 'text-gray-700'}`}
                        >
                          <span>{language.flag}</span>
                          <span>{language.name}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <button className="p-2" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                  {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
              </div>
            </div>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="lg:hidden bg-white border-t">
              <div className="px-4 py-4 space-y-2">
                <button onClick={() => scrollToSection('home')} className="block w-full text-left py-2 text-gray-600">{t.nav.home}</button>
                <button onClick={() => scrollToSection('services')} className="block w-full text-left py-2 text-gray-600">{t.nav.services}</button>
                <button onClick={() => scrollToSection('projects')} className="block w-full text-left py-2 text-gray-600">{t.nav.projects}</button>
                <button onClick={() => scrollToSection('products')} className="block w-full text-left py-2 text-gray-600">{t.nav.products}</button>
                <button onClick={() => scrollToSection('process')} className="block w-full text-left py-2 text-gray-600">{t.nav.process}</button>
                <button onClick={() => scrollToSection('testimonials')} className="block w-full text-left py-2 text-gray-600">{t.nav.reviews}</button>
                <button
                  onClick={() => scrollToSection('contact')}
                  className="block w-full bg-amber-500 text-white py-3 rounded-lg font-medium text-center mt-4"
                >
                  {t.nav.contact}
                </button>
              </div>
            </div>
          )}
        </nav>

        {/* Hero Section */}
        <section id="home" className="relative min-h-[100svh] flex items-center pt-14 sm:pt-16">
          <div
            className="absolute inset-0 z-0"
            style={{
              backgroundImage: 'url(https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1920)',
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-gray-900/90 to-gray-900/70" />
          </div>

          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 bg-amber-500/20 text-amber-400 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium mb-4 sm:mb-6">
                <MapPin className="w-3 h-3 sm:w-4 sm:h-4" />
                {t.hero.badge}
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-white leading-tight mb-4 sm:mb-6">
                {t.hero.tagline}
              </h1>

              <p className="text-base sm:text-lg lg:text-xl text-gray-300 mb-6 sm:mb-8 leading-relaxed">
                {t.hero.description}
              </p>

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-8 sm:mb-12">
                <button
                  onClick={() => scrollToSection('contact')}
                  className="bg-amber-500 hover:bg-amber-600 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-semibold text-base sm:text-lg transition-all transform hover:scale-105 flex items-center justify-center gap-2"
                >
                  {t.hero.cta}
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
                <button
                  onClick={() => scrollToSection('projects')}
                  className="border-2 border-white/30 hover:border-white/50 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-semibold text-base sm:text-lg transition-colors flex items-center justify-center gap-2"
                >
                  {t.hero.viewProjects}
                </button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 sm:gap-8">
                <div>
                  <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-amber-400">{companyInfo.projectsCompleted}</div>
                  <div className="text-xs sm:text-sm text-gray-400">{t.hero.projects}</div>
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-amber-400">{companyInfo.yearsExperience}</div>
                  <div className="text-xs sm:text-sm text-gray-400">{t.hero.experience}</div>
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-amber-400">100%</div>
                  <div className="text-xs sm:text-sm text-gray-400">{t.hero.satisfaction}</div>
                </div>
              </div>
            </div>
          </div>

        </section>

        {/* Services Section */}
        <section id="services" className="py-12 sm:py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10 sm:mb-16">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
                {t.services.title}
              </h2>
              <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-2xl mx-auto">
                {t.services.subtitle}
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
              {t.services.items.map((service, index) => {
                const Icon = serviceIcons[index];
                return (
                  <div
                    key={index}
                    className="bg-white rounded-xl sm:rounded-2xl p-6 sm:p-8 shadow-sm hover:shadow-xl transition-all duration-300 group"
                  >
                    <div className="w-12 h-12 sm:w-14 sm:h-14 bg-amber-100 rounded-xl flex items-center justify-center mb-4 sm:mb-6 group-hover:bg-amber-500 transition-colors">
                      <Icon className="w-6 h-6 sm:w-7 sm:h-7 text-amber-600 group-hover:text-white transition-colors" />
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3">{service.title}</h3>
                    <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4">{service.description}</p>
                    <ul className="space-y-1.5 sm:space-y-2">
                      {service.features.map((feature, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-xs sm:text-sm text-gray-500">
                          <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-500 flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Projects Section */}
        <section id="projects" className="py-12 sm:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10 sm:mb-16">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
                {t.projects.title}
              </h2>
              <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-2xl mx-auto">
                {t.projects.subtitle}
              </p>
            </div>

            {/* Project Tabs */}
            <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-8 sm:mb-10">
              {completedProjects.map((project, index) => (
                <button
                  key={project.id}
                  onClick={() => { setActiveProject(index); setActiveImage(0); }}
                  className={`px-4 sm:px-5 py-1.5 sm:py-2 rounded-full font-medium text-sm transition-all ${
                    activeProject === index
                      ? 'bg-amber-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {project.category[lang]}
                </button>
              ))}
            </div>

            {/* Active Project Display */}
            <div className="grid lg:grid-cols-2 gap-6 sm:gap-10 items-center">
              {/* Image Gallery */}
              <div className="relative">
                <div className="aspect-[4/3] rounded-xl sm:rounded-2xl overflow-hidden shadow-xl sm:shadow-2xl">
                  <img
                    src={completedProjects[activeProject].images[activeImage]}
                    alt={completedProjects[activeProject].title[lang]}
                    className="w-full h-full object-cover transition-opacity duration-500"
                  />
                </div>

                {/* Image navigation */}
                <div className="absolute bottom-3 sm:bottom-4 left-1/2 transform -translate-x-1/2 flex gap-1.5 sm:gap-2">
                  {completedProjects[activeProject].images.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImage(idx)}
                      className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full transition-all ${
                        activeImage === idx ? 'bg-amber-500 w-6 sm:w-8' : 'bg-white/70'
                      }`}
                    />
                  ))}
                </div>

                {/* Navigation arrows */}
                <button
                  onClick={() => setActiveImage((prev) => prev === 0 ? completedProjects[activeProject].images.length - 1 : prev - 1)}
                  className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 bg-white/90 rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-colors"
                >
                  <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700" />
                </button>
                <button
                  onClick={() => setActiveImage((prev) => (prev + 1) % completedProjects[activeProject].images.length)}
                  className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 bg-white/90 rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-colors"
                >
                  <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700" />
                </button>
              </div>

              {/* Project Info */}
              <div>
                <span className="inline-block bg-amber-100 text-amber-700 px-3 sm:px-4 py-1 rounded-full text-xs sm:text-sm font-medium mb-3 sm:mb-4">
                  {completedProjects[activeProject].category[lang]}
                </span>
                <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-3 sm:mb-4">
                  {completedProjects[activeProject].title[lang]}
                </h3>

                <div className="flex flex-wrap gap-3 sm:gap-4 mb-4 sm:mb-6 text-xs sm:text-sm">
                  <div className="flex items-center gap-1.5 sm:gap-2 text-gray-500">
                    <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    {completedProjects[activeProject].location}
                  </div>
                  <div className="flex items-center gap-1.5 sm:gap-2 text-gray-500">
                    <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    {completedProjects[activeProject].duration[lang]}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-6 sm:mb-8">
                  {completedProjects[activeProject].features[lang].map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-1.5 sm:gap-2 text-sm sm:text-base text-gray-700">
                      <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500 flex-shrink-0" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => scrollToSection('contact')}
                  className="bg-amber-500 hover:bg-amber-600 text-white px-5 sm:px-6 py-2.5 sm:py-3 rounded-lg font-medium text-sm sm:text-base transition-colors flex items-center gap-2"
                >
                  {t.nav.contact}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Products Section - NEW */}
        <section id="products" className="py-12 sm:py-20 bg-gradient-to-br from-amber-50 to-orange-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10 sm:mb-16">
              <div className="inline-flex items-center gap-2 bg-amber-500/10 text-amber-600 px-4 py-2 rounded-full text-sm font-medium mb-4">
                <ShoppingBag className="w-4 h-4" />
                Shop
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
                {t.products.title}
              </h2>
              <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-2xl mx-auto">
                {t.products.subtitle}
              </p>
            </div>

            {/* Product Features */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-10 sm:mb-16">
              {t.products.features.map((feature, index) => {
                const icons = [Package, Truck, Users, Shield];
                const Icon = icons[index];
                return (
                  <div key={index} className="bg-white rounded-xl p-5 sm:p-6 text-center shadow-sm">
                    <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                      <Icon className="w-6 h-6 text-amber-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">{feature.title}</h3>
                    <p className="text-sm text-gray-500">{feature.description}</p>
                  </div>
                );
              })}
            </div>

            {/* Product Categories */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {t.products.categories.map((category, index) => {
                const categoryImages = [
                  'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400',
                  'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=400',
                  'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400',
                  'https://images.unsplash.com/photo-1581147036324-c17ac41f3e3b?w=400'
                ];
                return (
                  <div key={index} className="group relative rounded-xl overflow-hidden shadow-lg cursor-pointer" onClick={() => scrollToSection('contact')}>
                    <div className="aspect-[4/3]">
                      <img src={categoryImages[index]} alt={category.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900/90 via-gray-900/40 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6">
                      <h3 className="text-lg sm:text-xl font-bold text-white mb-1">{category.name}</h3>
                      <p className="text-xs sm:text-sm text-gray-300">{category.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="text-center mt-8 sm:mt-12">
              <button
                onClick={() => scrollToSection('contact')}
                className="bg-amber-500 hover:bg-amber-600 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-semibold text-base sm:text-lg transition-all flex items-center gap-2 mx-auto"
              >
                {t.products.cta}
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </section>

        {/* Process Section */}
        <section id="process" className="py-12 sm:py-20 bg-gray-900 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10 sm:mb-16">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4">
                {t.process.title}
              </h2>
              <p className="text-base sm:text-lg lg:text-xl text-gray-400 max-w-2xl mx-auto">
                {t.process.subtitle}
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
              {t.process.steps.map((step, index) => (
                <div
                  key={index}
                  className="relative bg-gray-800/50 rounded-xl sm:rounded-2xl p-5 sm:p-6 border border-gray-700 hover:border-amber-500/50 transition-colors"
                >
                  <div className="absolute -top-3 -left-3 sm:-top-4 sm:-left-4 w-10 h-10 sm:w-12 sm:h-12 bg-amber-500 rounded-xl flex items-center justify-center font-bold text-lg sm:text-xl">
                    {index + 1}
                  </div>
                  <div className="pt-4 sm:pt-4">
                    <h3 className="text-base sm:text-xl font-bold mb-2">{step.title}</h3>
                    <p className="text-sm sm:text-base text-gray-400">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section id="testimonials" className="py-12 sm:py-20 bg-amber-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10 sm:mb-16">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
                {t.testimonials.title}
              </h2>
              <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-2xl mx-auto">
                {t.testimonials.subtitle}
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
              {testimonials.map((testimonial, index) => (
                <div key={index} className="bg-white rounded-xl sm:rounded-2xl p-6 sm:p-8 shadow-sm">
                  <div className="flex items-center gap-1 mb-3 sm:mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 sm:w-5 sm:h-5 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-sm sm:text-base text-gray-700 mb-4 sm:mb-6 italic">"{testimonial.text[lang]}"</p>
                  <div className="border-t pt-3 sm:pt-4">
                    <div className="font-semibold text-gray-900">{testimonial.name}</div>
                    <div className="text-xs sm:text-sm text-gray-500">{testimonial.location} • {testimonial.project[lang]}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section id="contact" className="py-12 sm:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-8 sm:gap-12">
              {/* Contact Info */}
              <div>
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4 sm:mb-6">
                  {t.contact.title}
                </h2>
                <p className="text-base sm:text-lg lg:text-xl text-gray-600 mb-6 sm:mb-8">
                  {t.contact.subtitle}
                </p>

                <div className="space-y-4 sm:space-y-6 mb-8 sm:mb-10">
                  <a href={`tel:+32${companyInfo.phone}`} className="flex items-center gap-3 sm:gap-4 group">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 bg-amber-100 rounded-xl flex items-center justify-center group-hover:bg-amber-500 transition-colors">
                      <Phone className="w-5 h-5 sm:w-6 sm:h-6 text-amber-600 group-hover:text-white transition-colors" />
                    </div>
                    <div>
                      <div className="text-xs sm:text-sm text-gray-500">{t.contact.phone}</div>
                      <div className="text-base sm:text-lg font-semibold text-gray-900">{companyInfo.phoneFormatted}</div>
                    </div>
                  </a>

                  <a href={`mailto:${companyInfo.email}`} className="flex items-center gap-3 sm:gap-4 group">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 bg-amber-100 rounded-xl flex items-center justify-center group-hover:bg-amber-500 transition-colors">
                      <Mail className="w-5 h-5 sm:w-6 sm:h-6 text-amber-600 group-hover:text-white transition-colors" />
                    </div>
                    <div>
                      <div className="text-xs sm:text-sm text-gray-500">{t.contact.email}</div>
                      <div className="text-base sm:text-lg font-semibold text-gray-900">{companyInfo.email}</div>
                    </div>
                  </a>

                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 bg-amber-100 rounded-xl flex items-center justify-center">
                      <MapPin className="w-5 h-5 sm:w-6 sm:h-6 text-amber-600" />
                    </div>
                    <div>
                      <div className="text-xs sm:text-sm text-gray-500">{t.contact.location}</div>
                      <div className="text-base sm:text-lg font-semibold text-gray-900">{companyInfo.address}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 bg-amber-100 rounded-xl flex items-center justify-center">
                      <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-amber-600" />
                    </div>
                    <div>
                      <div className="text-xs sm:text-sm text-gray-500">{t.contact.hours}</div>
                      <div className="text-base sm:text-lg font-semibold text-gray-900">{companyInfo.hours}</div>
                    </div>
                  </div>
                </div>

                {/* Badges */}
                <div className="flex flex-wrap gap-3 sm:gap-4">
                  <div className="flex items-center gap-2 bg-gray-100 px-3 sm:px-4 py-2 rounded-lg">
                    <Award className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600" />
                    <span className="text-xs sm:text-sm font-medium">{t.contact.badges[0]}</span>
                  </div>
                </div>
              </div>

              {/* Contact Form */}
              <div className="bg-gray-50 rounded-xl sm:rounded-2xl p-6 sm:p-8">
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">
                  {t.hero.cta}
                </h3>

                {formStatus === 'success' ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle2 className="w-8 h-8 text-green-600" />
                    </div>
                    <h4 className="text-xl font-semibold text-gray-900 mb-2">
                      {lang === 'nl' ? 'Bericht Verzonden!' : lang === 'de' ? 'Nachricht Gesendet!' : lang === 'fr' ? 'Message Envoyé!' : 'Message Sent!'}
                    </h4>
                    <p className="text-gray-600 mb-4">
                      {lang === 'nl' ? 'Wij nemen zo snel mogelijk contact met u op.' : lang === 'de' ? 'Wir werden uns so schnell wie möglich bei Ihnen melden.' : lang === 'fr' ? 'Nous vous contacterons dès que possible.' : 'We will contact you as soon as possible.'}
                    </p>
                    <button
                      onClick={() => setFormStatus('idle')}
                      className="text-amber-600 hover:text-amber-700 font-medium"
                    >
                      {lang === 'nl' ? 'Nog een bericht sturen' : lang === 'de' ? 'Eine weitere Nachricht senden' : lang === 'fr' ? 'Envoyer un autre message' : 'Send another message'}
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleFormSubmit} className="space-y-4 sm:space-y-6">
                    {formStatus === 'error' && (
                      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                        {formError}
                      </div>
                    )}

                    <div className="grid sm:grid-cols-2 gap-3 sm:gap-4">
                      <div>
                        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">{t.contact.form.name} *</label>
                        <input
                          type="text"
                          required
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all text-sm sm:text-base"
                        />
                      </div>
                      <div>
                        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">{t.contact.form.phone} *</label>
                        <input
                          type="tel"
                          required
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all text-sm sm:text-base"
                          placeholder="+32 ..."
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">{t.contact.form.email} *</label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all text-sm sm:text-base"
                      />
                    </div>

                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">{t.contact.form.projectType}</label>
                      <select
                        value={formData.projectType}
                        onChange={(e) => setFormData({ ...formData, projectType: e.target.value })}
                        className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all bg-white text-sm sm:text-base"
                      >
                        <option value="">{t.contact.form.select}</option>
                        {t.contact.form.types.map((type, idx) => (
                          <option key={idx} value={type}>{type}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">{t.contact.form.message} *</label>
                      <textarea
                        rows={4}
                        required
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all resize-none text-sm sm:text-base"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={formStatus === 'sending'}
                      className="w-full bg-amber-500 hover:bg-amber-600 disabled:bg-amber-400 text-white py-3 sm:py-4 rounded-lg font-semibold text-base sm:text-lg transition-colors flex items-center justify-center gap-2"
                    >
                      {formStatus === 'sending' ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          {lang === 'nl' ? 'Verzenden...' : lang === 'de' ? 'Senden...' : lang === 'fr' ? 'Envoi...' : 'Sending...'}
                        </>
                      ) : (
                        <>
                          {t.contact.form.submit}
                          <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                        </>
                      )}
                    </button>

                    <p className="text-xs sm:text-sm text-gray-500 text-center">
                      {t.contact.form.response}
                    </p>
                  </form>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-gray-900 text-white py-10 sm:py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 mb-6 sm:mb-8">
              <div className="sm:col-span-2">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-amber-500 rounded-lg flex items-center justify-center">
                    <Building2 className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <span className="text-lg sm:text-xl font-bold">L&E Bouw</span>
                </div>
                <p className="text-sm sm:text-base text-gray-400 max-w-md">
                  {t.hero.description}
                </p>
              </div>

              <div>
                <h4 className="font-semibold mb-3 sm:mb-4">{t.footer.services}</h4>
                <ul className="space-y-1.5 sm:space-y-2 text-sm sm:text-base text-gray-400">
                  {t.services.items.slice(0, 4).map((s, i) => <li key={i}>{s.title}</li>)}
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-3 sm:mb-4">{t.footer.contact}</h4>
                <ul className="space-y-1.5 sm:space-y-2 text-sm sm:text-base text-gray-400">
                  <li><a href={`tel:+32${companyInfo.phone}`} className="hover:text-amber-400">{companyInfo.phoneFormatted}</a></li>
                  <li><a href={`mailto:${companyInfo.email}`} className="hover:text-amber-400">{companyInfo.email}</a></li>
                  <li>{companyInfo.address}</li>
                </ul>
              </div>
            </div>

            <div className="border-t border-gray-800 pt-6 sm:pt-8 text-center text-gray-500 text-xs sm:text-sm">
              <p>&copy; {new Date().getFullYear()} L&E Bouw. {t.footer.rights}</p>
              <p className="mt-2">{t.footer.seoText}</p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
};

export default Portfolio;
