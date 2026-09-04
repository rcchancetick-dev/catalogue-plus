export default function Footer() {
  return (
    <footer className="footer" id="contact">
      <div className="footer-inner">
        <div className="footer-col"><h4>Catalogue+</h4><p>Catalogue numerique de bibliotheque par QR Code, gestion complete des emprunts en ligne et hors-ligne.</p></div>
        <div className="footer-col"><h4>A propos du projet</h4><p>Mini-projet realise par des etudiants de 2eme annee de l'<strong>Ecole Superieure Polytechnique d'Antsiranana (ESPA)</strong>, Madagascar.</p></div>
        <div className="footer-col"><h4>Confidentialite &amp; securite</h4><ul><li>Mots de passe chiffres (bcrypt)</li><li>Connexions HTTPS + cookies HttpOnly</li><li>Donnees sur Neon Postgres</li><li>Acces admin protege</li></ul></div>
        <div className="footer-col"><h4>Contact</h4><p>Bibliotheque ESPA<br />Antsiranana, Madagascar</p></div>
      </div>
      <div className="footer-bottom"><p>© {new Date().getFullYear()} Catalogue+ — Projet academique ESPA. Tous droits reserves aux auteurs du projet.</p></div>
    </footer>
  );
}
