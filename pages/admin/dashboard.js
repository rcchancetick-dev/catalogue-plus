import { useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import Toast from '../../components/Toast';
import Icon from '../../components/Icon';
import NotificationBell from '../../components/NotificationBell';
import PushNotificationSetup from '../../components/PushNotificationSetup';
import AnimatedButton from '../../components/animations/AnimatedButton';

const TABS = [{ id: 'stats', label: 'Statistiques', icon: 'bar-chart' },{ id: 'livres', label: 'Livres', icon: 'book' },{ id: 'emprunts', label: "Demandes d'emprunt", icon: 'mail' },{ id: 'historique', label: 'Historique', icon: 'clock' },{ id: 'admins', label: 'Administrateurs', icon: 'user' },{ id: 'export', label: 'Exports', icon: 'download' }];

export default function AdminDashboard() {
  const router = useRouter();
  const [admin, setAdmin] = useState(null); const [tab, setTab] = useState('stats'); const [stats, setStats] = useState(null); const [books, setBooks] = useState([]);
  const [pendingLoans, setPendingLoans] = useState([]); const [allLoans, setAllLoans] = useState([]); const [admins, setAdmins] = useState([]);
  const [toast, setToast] = useState(''); const [toastType, setToastType] = useState('info'); const [showAddBook, setShowAddBook] = useState(false); const [showAddAdmin, setShowAddAdmin] = useState(false);
  const [rejectingLoan, setRejectingLoan] = useState(null); const [motif, setMotif] = useState('');
  const [newBook, setNewBook] = useState({ titre: '', auteur: '', isbn: '', editeur: '', annee_publication: '', categorie: '', langue: 'Francais', nombre_pages: '', description: '', couverture_url: '', emplacement: '', nombre_exemplaires: 1 });
  const [newAdmin, setNewAdmin] = useState({ nom: '', prenom: '', email: '', password: '', role: 'admin' }); const [generatedQr, setGeneratedQr] = useState(null);
  function showToast(msg, type = 'info') { setToastType(type); setToast(msg); setTimeout(() => setToast(''), 4500); }
  useEffect(() => { fetch('/api/auth/admin-me').then(r => r.json()).then(d => { if (!d.admin) { router.push('/admin/connexion'); return; } setAdmin(d.admin); loadAll(); fetch('/api/admin/check-overdue', { method: 'POST' }).catch(() => {}); }); }, []);
  function loadAll() {
    fetch('/api/admin/stats').then(r => r.json()).then(setStats).catch(() => {});
    fetch('/api/books').then(r => r.json()).then(d => setBooks(d.books || [])).catch(() => {});
    fetch('/api/loans?statut=en_attente').then(r => r.json()).then(d => setPendingLoans(d.loans || [])).catch(() => {});
    fetch('/api/loans').then(r => r.json()).then(d => setAllLoans(d.loans || [])).catch(() => {});
    fetch('/api/admin/admins').then(r => r.json()).then(d => setAdmins(d.admins || [])).catch(() => {});
  }
  async function handleLogout() { await fetch('/api/auth/admin-logout', { method: 'POST' }); router.push('/admin/connexion'); }
  async function handleAddBook(e) {
    e.preventDefault();
    try { const res = await fetch('/api/books', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newBook) }); const data = await res.json(); if (!res.ok) throw new Error(data.error); showToast(data.message, 'success'); setGeneratedQr({ qr: data.book.qr_code_data, titre: data.book.titre, url: data.qrUrl }); setShowAddBook(false); setNewBook({ titre: '', auteur: '', isbn: '', editeur: '', annee_publication: '', categorie: '', langue: 'Francais', nombre_pages: '', description: '', couverture_url: '', emplacement: '', nombre_exemplaires: 1 }); loadAll(); } catch (err) { showToast(err.message, 'error'); }
  }
  async function handleValidateLoan(id) { try { const res = await fetch('/api/loans/validate/' + id, { method: 'POST' }); const data = await res.json(); if (!res.ok) throw new Error(data.error); showToast(data.message, 'success'); loadAll(); } catch (err) { showToast(err.message, 'error'); } }
  async function handleRejectLoan(id) { try { const res = await fetch('/api/loans/reject/' + id, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ motif }) }); const data = await res.json(); if (!res.ok) throw new Error(data.error); showToast(data.message, 'success'); setRejectingLoan(null); setMotif(''); loadAll(); } catch (err) { showToast(err.message, 'error'); } }
  async function handleMarkReturned(uid) { try { const res = await fetch('/api/books/return/' + uid, { method: 'POST' }); const data = await res.json(); if (!res.ok) throw new Error(data.error); showToast(data.message, 'success'); loadAll(); } catch (err) { showToast(err.message, 'error'); } }
  async function handleAddAdmin(e) { e.preventDefault(); try { const res = await fetch('/api/admin/admins', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newAdmin) }); const data = await res.json(); if (!res.ok) throw new Error(data.error); showToast(data.message, 'success'); setShowAddAdmin(false); setNewAdmin({ nom: '', prenom: '', email: '', password: '', role: 'admin' }); loadAll(); } catch (err) { showToast(err.message, 'error'); } }
  async function handleToggleAdmin(id) { try { const res = await fetch('/api/admin/toggle-admin/' + id, { method: 'POST' }); const data = await res.json(); if (!res.ok) throw new Error(data.error); showToast(data.message, 'success'); loadAll(); } catch (err) { showToast(err.message, 'error'); } }
  function printQr() { const w = window.open('', '_blank'); w.document.write('<html><head><title>QR Code - ' + generatedQr.titre + '</title></head><body style="text-align:center;font-family:sans-serif;padding:40px;"><h2>' + generatedQr.titre + '</h2><img src="' + generatedQr.qr + '" style="width:300px;" /><p>' + generatedQr.url + '</p><script>window.print()</script></body></html>'); }
  if (!admin) return null;
  return (
    <>
      <Head><title>Tableau de bord | Admin Catalogue+</title><meta name="robots" content="noindex, nofollow" /></Head>
      <Toast message={toast} type={toastType} onClose={() => setToast('')} />
      <div className="admin-layout">
        <aside className="admin-sidebar">
          <div className="admin-sidebar-brand"><Icon name="book" size={20} /> Catalogue+ <span>Admin</span></div>
          <p className="admin-sidebar-user">{admin.prenom} {admin.nom}<br /><small>{admin.role}</small></p>
          <NotificationBell scope="admin" />
          <nav>{TABS.map(t => <button key={t.id} className={tab === t.id ? 'active' : ''} onClick={() => setTab(t.id)}><Icon name={t.icon} size={16} /> <span>{t.label}</span></button>)}</nav>
          <button className="admin-logout-btn" onClick={handleLogout}><Icon name="log-out" size={16} /> <span>Deconnexion</span></button>
        </aside>
        <main className="admin-main">
          <PushNotificationSetup />
          <AnimatePresence mode="wait">
            {tab === 'stats' && stats && (
              <motion.div key="stats" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <h1>Tableau de bord</h1>
                <div className="admin-stats-grid">
                  <div className="admin-stat-card"><span>{stats.totalBooks.count}</span><p>Titres references</p></div>
                  <div className="admin-stat-card"><span>{stats.totalUsers}</span><p>Utilisateurs inscrits</p></div>
                  <div className="admin-stat-card highlight"><span>{stats.pendingLoans}</span><p>Demandes en attente</p></div>
                  <div className="admin-stat-card"><span>{stats.activeLoans}</span><p>Emprunts en cours</p></div>
                  <div className="admin-stat-card danger"><span>{stats.overdueLoans}</span><p>Emprunts en retard</p></div>
                </div>
                <h2>Livres les plus empruntes</h2>
                <div className="admin-table-wrapper"><table className="admin-table"><thead><tr><th>Titre</th><th>Auteur</th><th>Nb emprunts</th></tr></thead><tbody>{stats.topBooks.map((b, i) => <tr key={i}><td>{b.titre}</td><td>{b.auteur}</td><td>{b.nb_emprunts}</td></tr>)}</tbody></table></div>
                <h2>Activite recente</h2>
                <ul className="admin-activity-list">{stats.recentActivity.slice(0, 10).map((a) => <li key={a.id}><strong>{a.admin_prenom} {a.admin_nom}</strong> — {a.description} <small>({new Date(a.created_at).toLocaleString('fr-FR')})</small></li>)}</ul>
              </motion.div>
            )}
            {tab === 'livres' && (
              <motion.div key="livres" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <div className="admin-section-header"><h1>Gestion des livres</h1><AnimatedButton className="btn-primary" onClick={() => setShowAddBook(true)}>+ Ajouter un livre</AnimatedButton></div>
                <div className="admin-table-wrapper"><table className="admin-table"><thead><tr><th>Titre</th><th>Auteur</th><th>Categorie</th><th>Dispo</th><th>Statut</th><th>Actions</th></tr></thead>
                  <tbody>{books.map(b => (<tr key={b.id}><td>{b.titre}</td><td>{b.auteur}</td><td>{b.categorie || '-'}</td><td>{b.exemplaires_disponibles}/{b.nombre_exemplaires}</td><td><span className={'status-badge ' + (b.statut === 'disponible' ? 'status-active' : 'status-pending')}>{b.statut}</span></td><td><button className="btn-small" onClick={() => setGeneratedQr({ qr: b.qr_code_data, titre: b.titre, url: (process.env.NEXT_PUBLIC_SITE_URL || '') + '/livre/' + b.uid })}><Icon name="qr-code" size={13} /> QR</button>{b.exemplaires_disponibles < b.nombre_exemplaires && <button className="btn-small btn-small-success" onClick={() => handleMarkReturned(b.uid)}>Marquer rendu</button>}</td></tr>))}</tbody>
                </table></div>
              </motion.div>
            )}
            {tab === 'emprunts' && (
              <motion.div key="emprunts" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <h1>Demandes d'emprunt en attente</h1>
                {pendingLoans.length === 0 ? <p className="loading-text">Aucune demande en attente.</p> : (
                  <div className="admin-table-wrapper"><table className="admin-table"><thead><tr><th>Etudiant</th><th>Livre</th><th>Duree</th><th>Date demande</th><th>Actions</th></tr></thead>
                    <tbody>{pendingLoans.map(l => (<tr key={l.id}><td>{l.user_prenom} {l.user_nom}<br /><small>{l.user_email}</small></td><td>{l.livre_titre}</td><td>{l.duree_jours} jours</td><td>{new Date(l.date_demande).toLocaleDateString('fr-FR')}</td><td><button className="btn-small btn-small-success" onClick={() => handleValidateLoan(l.id)}>Valider</button><button className="btn-small btn-small-danger" onClick={() => setRejectingLoan(l.id)}>Refuser</button></td></tr>))}</tbody>
                  </table></div>
                )}
              </motion.div>
            )}
            {tab === 'historique' && (
              <motion.div key="historique" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <h1>Historique complet des emprunts</h1>
                <div className="admin-table-wrapper"><table className="admin-table"><thead><tr><th>Etudiant</th><th>Livre</th><th>Statut</th><th>Demande</th><th>Retour prevu</th></tr></thead>
                  <tbody>{allLoans.map(l => (<tr key={l.id}><td>{l.user_prenom} {l.user_nom}</td><td>{l.livre_titre}</td><td>{l.statut}</td><td>{new Date(l.date_demande).toLocaleDateString('fr-FR')}</td><td>{l.date_retour_prevue ? new Date(l.date_retour_prevue).toLocaleDateString('fr-FR') : '-'}</td></tr>))}</tbody>
                </table></div>
              </motion.div>
            )}
            {tab === 'admins' && (
              <motion.div key="admins" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <div className="admin-section-header"><h1>Administrateurs</h1>{admin.role === 'super_admin' && <AnimatedButton className="btn-primary" onClick={() => setShowAddAdmin(true)}>+ Ajouter un admin</AnimatedButton>}</div>
                <div className="admin-table-wrapper"><table className="admin-table"><thead><tr><th>Nom</th><th>Email</th><th>Role</th><th>Statut</th>{admin.role === 'super_admin' && <th>Actions</th>}</tr></thead>
                  <tbody>{admins.map(a => (<tr key={a.id}><td>{a.prenom} {a.nom}</td><td>{a.email}</td><td>{a.role}</td><td>{a.is_active ? 'Actif' : 'Desactive'}</td>{admin.role === 'super_admin' && <td><button className="btn-small" onClick={() => handleToggleAdmin(a.id)}>{a.is_active ? 'Desactiver' : 'Reactiver'}</button></td>}</tr>))}</tbody>
                </table></div>
              </motion.div>
            )}
            {tab === 'export' && (
              <motion.div key="export" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <h1>Exporter les donnees</h1>
                <div className="export-grid">
                  <div className="export-card"><h3><Icon name="book" size={20} /> Livres</h3><a href="/api/admin/export-excel?type=livres" className="btn-secondary">Excel</a><a href="/api/admin/export-pdf?type=livres" className="btn-secondary">PDF</a></div>
                  <div className="export-card"><h3><Icon name="mail" size={20} /> Emprunts</h3><a href="/api/admin/export-excel?type=emprunts" className="btn-secondary">Excel</a><a href="/api/admin/export-pdf?type=emprunts" className="btn-secondary">PDF</a></div>
                  <div className="export-card"><h3><Icon name="users" size={20} /> Utilisateurs</h3><a href="/api/admin/export-excel?type=utilisateurs" className="btn-secondary">Excel</a></div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
      <AnimatePresence>
        {showAddBook && (
          <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowAddBook(false)}>
            <motion.div className="modal-content" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} onClick={(e) => e.stopPropagation()}>
              <h2>Ajouter un livre</h2>
              <form onSubmit={handleAddBook} className="auth-form">
                <div className="form-row"><div><label>Titre *</label><input required value={newBook.titre} onChange={(e) => setNewBook({ ...newBook, titre: e.target.value })} /></div><div><label>Auteur *</label><input required value={newBook.auteur} onChange={(e) => setNewBook({ ...newBook, auteur: e.target.value })} /></div></div>
                <div className="form-row"><div><label>ISBN</label><input value={newBook.isbn} onChange={(e) => setNewBook({ ...newBook, isbn: e.target.value })} /></div><div><label>Editeur</label><input value={newBook.editeur} onChange={(e) => setNewBook({ ...newBook, editeur: e.target.value })} /></div></div>
                <div className="form-row"><div><label>Annee</label><input type="number" value={newBook.annee_publication} onChange={(e) => setNewBook({ ...newBook, annee_publication: e.target.value })} /></div><div><label>Categorie</label><input value={newBook.categorie} onChange={(e) => setNewBook({ ...newBook, categorie: e.target.value })} /></div></div>
                <div className="form-row"><div><label>Nb pages</label><input type="number" value={newBook.nombre_pages} onChange={(e) => setNewBook({ ...newBook, nombre_pages: e.target.value })} /></div><div><label>Nb exemplaires</label><input type="number" min={1} value={newBook.nombre_exemplaires} onChange={(e) => setNewBook({ ...newBook, nombre_exemplaires: e.target.value })} /></div></div>
                <label>Emplacement</label><input value={newBook.emplacement} onChange={(e) => setNewBook({ ...newBook, emplacement: e.target.value })} placeholder="Ex: Rayon A - Etagere 2" />
                <label>URL couverture (optionnel)</label><input value={newBook.couverture_url} onChange={(e) => setNewBook({ ...newBook, couverture_url: e.target.value })} />
                <label>Description</label><textarea rows={3} value={newBook.description} onChange={(e) => setNewBook({ ...newBook, description: e.target.value })} />
                <div className="modal-actions"><button type="button" className="btn-secondary" onClick={() => setShowAddBook(false)}>Annuler</button><AnimatedButton type="submit" className="btn-primary">Enregistrer et generer le QR</AnimatedButton></div>
              </form>
            </motion.div>
          </motion.div>
        )}
        {generatedQr && (
          <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setGeneratedQr(null)}>
            <motion.div className="modal-content modal-qr" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} onClick={(e) => e.stopPropagation()}>
              <h2>QR Code genere</h2><p>{generatedQr.titre}</p>
              <img src={generatedQr.qr} alt="QR Code" style={{ width: '250px', maxWidth: '100%', margin: '0 auto', display: 'block' }} />
              <div className="modal-actions"><button className="btn-secondary" onClick={() => setGeneratedQr(null)}>Fermer</button><AnimatedButton className="btn-primary" onClick={printQr}><Icon name="printer" size={16} /> Imprimer</AnimatedButton></div>
            </motion.div>
          </motion.div>
        )}
        {showAddAdmin && (
          <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowAddAdmin(false)}>
            <motion.div className="modal-content" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} onClick={(e) => e.stopPropagation()}>
              <h2>Ajouter un administrateur</h2>
              <form onSubmit={handleAddAdmin} className="auth-form">
                <div className="form-row"><div><label>Nom</label><input required value={newAdmin.nom} onChange={(e) => setNewAdmin({ ...newAdmin, nom: e.target.value })} /></div><div><label>Prenom</label><input required value={newAdmin.prenom} onChange={(e) => setNewAdmin({ ...newAdmin, prenom: e.target.value })} /></div></div>
                <label>Email</label><input type="email" required value={newAdmin.email} onChange={(e) => setNewAdmin({ ...newAdmin, email: e.target.value })} />
                <label>Mot de passe</label><input type="password" required minLength={8} value={newAdmin.password} onChange={(e) => setNewAdmin({ ...newAdmin, password: e.target.value })} />
                <label>Role</label><select value={newAdmin.role} onChange={(e) => setNewAdmin({ ...newAdmin, role: e.target.value })}><option value="admin">Administrateur standard</option><option value="super_admin">Super-administrateur</option></select>
                <div className="modal-actions"><button type="button" className="btn-secondary" onClick={() => setShowAddAdmin(false)}>Annuler</button><AnimatedButton type="submit" className="btn-primary">Creer</AnimatedButton></div>
              </form>
            </motion.div>
          </motion.div>
        )}
        {rejectingLoan && (
          <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setRejectingLoan(null)}>
            <motion.div className="modal-content" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} onClick={(e) => e.stopPropagation()}>
              <h2>Motif du refus</h2>
              <textarea rows={4} value={motif} onChange={(e) => setMotif(e.target.value)} placeholder="Ex: livre reserve, document endommage..." />
              <div className="modal-actions"><button className="btn-secondary" onClick={() => setRejectingLoan(null)}>Annuler</button><AnimatedButton className="btn-primary" onClick={() => handleRejectLoan(rejectingLoan)}>Confirmer le refus</AnimatedButton></div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
