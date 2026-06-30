'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Pencil, Trash2, ChevronUp, ChevronDown, X } from 'lucide-react';
import styles from './ContestantManager.module.css';

interface Contestant {
  id: string;
  name: string;
  bio: string | null;
  imageUrl: string | null;
  totalVotes: number;
  eventTitle: string;
}

interface ContestantManagerProps {
  initialContestants: Contestant[];
}

type ModalMode = 'add' | 'edit' | 'votes' | 'delete' | null;

export default function ContestantManager({ initialContestants }: ContestantManagerProps) {
  const router = useRouter();
  const [contestants, setContestants] = useState<Contestant[]>(initialContestants);
  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [selectedContestant, setSelectedContestant] = useState<Contestant | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form state
  const [formName, setFormName] = useState('');
  const [formBio, setFormBio] = useState('');
  const [formImageUrl, setFormImageUrl] = useState('');
  const [formImageFile, setFormImageFile] = useState<File | null>(null);

  // Vote adjustment state
  const [voteAction, setVoteAction] = useState<'add' | 'deduct'>('add');
  const [voteAmount, setVoteAmount] = useState(1);

  function openAddModal() {
    setFormName('');
    setFormBio('');
    setFormImageUrl('');
    setFormImageFile(null);
    setSelectedContestant(null);
    setModalMode('add');
    setError('');
  }

  function openEditModal(contestant: Contestant) {
    setFormName(contestant.name);
    setFormBio(contestant.bio || '');
    setFormImageUrl(contestant.imageUrl || '');
    setFormImageFile(null);
    setSelectedContestant(contestant);
    setModalMode('edit');
    setError('');
  }

  function openDeleteModal(contestant: Contestant) {
    setSelectedContestant(contestant);
    setModalMode('delete');
    setError('');
  }

  function openVotesModal(contestant: Contestant) {
    setSelectedContestant(contestant);
    setVoteAction('add');
    setVoteAmount(1);
    setModalMode('votes');
    setError('');
  }

  function closeModal() {
    setModalMode(null);
    setSelectedContestant(null);
    setError('');
  }

  function showSuccess(msg: string) {
    setSuccess(msg);
    setTimeout(() => setSuccess(''), 3000);
  }

  async function handleAddEdit(e: FormEvent) {
    e.preventDefault();
    if (!formName.trim()) {
      setError('Name is required.');
      return;
    }
    setLoading(true);
    setError('');

    try {
      let finalImageUrl = formImageUrl.trim();

      if (formImageFile) {
        const formData = new FormData();
        formData.append('file', formImageFile);
        
        const uploadRes = await fetch('/api/admin/upload', {
          method: 'POST',
          body: formData,
        });
        
        const uploadData = await uploadRes.json();
        if (!uploadRes.ok) throw new Error(uploadData.error || 'Failed to upload image');
        
        finalImageUrl = uploadData.url;
      }

      if (modalMode === 'add') {
        const res = await fetch('/api/admin/contestants', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: formName.trim(),
            bio: formBio.trim(),
            imageUrl: finalImageUrl,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to add contestant');

        setContestants(prev => [{
          ...data.contestant,
          eventTitle: prev[0]?.eventTitle || 'Current Event',
        }, ...prev]);
        showSuccess(`${formName.trim()} added successfully!`);
      } else if (modalMode === 'edit' && selectedContestant) {
        const res = await fetch(`/api/admin/contestants/${selectedContestant.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: formName.trim(),
            bio: formBio.trim(),
            imageUrl: finalImageUrl,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to update contestant');

        setContestants(prev =>
          prev.map(c => c.id === selectedContestant.id
            ? { ...c, name: formName.trim(), bio: formBio.trim(), imageUrl: finalImageUrl }
            : c
          )
        );
        showSuccess(`${formName.trim()} updated successfully!`);
      }
      closeModal();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!selectedContestant) return;
    setLoading(true);
    setError('');

    try {
      const res = await fetch(`/api/admin/contestants/${selectedContestant.id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete contestant');

      setContestants(prev => prev.filter(c => c.id !== selectedContestant.id));
      showSuccess(`${selectedContestant.name} deleted successfully!`);
      closeModal();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }

  async function handleVoteAdjust(e: FormEvent) {
    e.preventDefault();
    if (!selectedContestant || voteAmount < 1) return;
    setLoading(true);
    setError('');

    try {
      const res = await fetch(`/api/admin/contestants/${selectedContestant.id}/votes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: voteAction, amount: voteAmount }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to adjust votes');

      setContestants(prev =>
        prev.map(c => c.id === selectedContestant.id
          ? { ...c, totalVotes: data.contestant.totalVotes }
          : c
        )
      );
      showSuccess(data.message);
      closeModal();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Contestants</h1>
          <p className={styles.pageSubtitle}>Manage contestants, edit details, and adjust votes.</p>
        </div>
        <button className={styles.addBtn} onClick={openAddModal}>
          <Plus size={18} />
          Add Contestant
        </button>
      </div>

      {success && <div className={styles.successMsg}>{success}</div>}

      <div className={styles.tableSection}>
        {contestants.length === 0 ? (
          <div className={styles.emptyState}>
            No contestants have been added yet. Click &quot;Add Contestant&quot; to get started.
          </div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Contestant</th>
                <th>Event</th>
                <th>Votes</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {contestants.map((contestant) => (
                <tr key={contestant.id}>
                  <td>
                    <div className={styles.contestantCell}>
                      {contestant.imageUrl ? (
                        <img
                          src={contestant.imageUrl}
                          alt={contestant.name}
                          className={styles.contestantImage}
                        />
                      ) : (
                        <div className={styles.contestantPlaceholder}>
                          {contestant.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <div className={styles.contestantName}>{contestant.name}</div>
                        {contestant.bio && (
                          <div className={styles.contestantBio}>{contestant.bio}</div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td>{contestant.eventTitle}</td>
                  <td>
                    <span className={styles.votesBadge}>
                      {contestant.totalVotes.toLocaleString()}
                    </span>
                  </td>
                  <td>
                    <div className={styles.actions}>
                      <button
                        className={`${styles.actionBtn} ${styles.voteBtn}`}
                        onClick={() => openVotesModal(contestant)}
                        title="Adjust votes"
                      >
                        <ChevronUp size={14} />
                        Votes
                      </button>
                      <button
                        className={`${styles.actionBtn} ${styles.editBtn}`}
                        onClick={() => openEditModal(contestant)}
                      >
                        <Pencil size={14} />
                        Edit
                      </button>
                      <button
                        className={`${styles.actionBtn} ${styles.deleteBtn}`}
                        onClick={() => openDeleteModal(contestant)}
                      >
                        <Trash2 size={14} />
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* ─── Modal Overlay ────────────────────── */}
      {modalMode && (
        <div className={styles.overlay} onClick={closeModal}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <button className={styles.modalClose} onClick={closeModal}>
              <X size={20} />
            </button>

            {/* Add / Edit Form */}
            {(modalMode === 'add' || modalMode === 'edit') && (
              <>
                <h2 className={styles.modalTitle}>
                  {modalMode === 'add' ? 'Add New Contestant' : `Edit ${selectedContestant?.name}`}
                </h2>
                <form onSubmit={handleAddEdit} className={styles.form}>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Full Name *</label>
                    <input
                      type="text"
                      className={styles.input}
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      placeholder="Contestant name"
                      required
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Bio</label>
                    <textarea
                      className={styles.textarea}
                      value={formBio}
                      onChange={(e) => setFormBio(e.target.value)}
                      placeholder="Short biography..."
                      rows={3}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Contestant Image</label>
                    <input
                      type="file"
                      accept="image/*"
                      className={styles.input}
                      onChange={(e) => {
                        if (e.target.files && e.target.files.length > 0) {
                          setFormImageFile(e.target.files[0]);
                        } else {
                          setFormImageFile(null);
                        }
                      }}
                    />
                    {modalMode === 'edit' && formImageUrl && !formImageFile && (
                      <div className={styles.currentImageHint}>
                        Current image: <a href={formImageUrl} target="_blank" rel="noopener noreferrer">View</a>
                        {' (Leave empty to keep current)'}
                      </div>
                    )}
                  </div>
                  {error && <div className={styles.errorMsg}>{error}</div>}
                  <div className={styles.modalActions}>
                    <button type="button" className={styles.cancelBtn} onClick={closeModal}>Cancel</button>
                    <button type="submit" className={styles.submitBtn} disabled={loading}>
                      {loading ? 'Saving...' : (modalMode === 'add' ? 'Add Contestant' : 'Save Changes')}
                    </button>
                  </div>
                </form>
              </>
            )}

            {/* Delete Confirmation */}
            {modalMode === 'delete' && selectedContestant && (
              <>
                <h2 className={styles.modalTitle}>Delete Contestant</h2>
                <p className={styles.modalText}>
                  Are you sure you want to delete <strong>{selectedContestant.name}</strong>?
                  This will also remove all associated payment records. This action cannot be undone.
                </p>
                {error && <div className={styles.errorMsg}>{error}</div>}
                <div className={styles.modalActions}>
                  <button type="button" className={styles.cancelBtn} onClick={closeModal}>Cancel</button>
                  <button
                    type="button"
                    className={styles.dangerBtn}
                    onClick={handleDelete}
                    disabled={loading}
                  >
                    {loading ? 'Deleting...' : 'Yes, Delete'}
                  </button>
                </div>
              </>
            )}

            {/* Vote Adjustment */}
            {modalMode === 'votes' && selectedContestant && (
              <>
                <h2 className={styles.modalTitle}>Adjust Votes</h2>
                <p className={styles.modalText}>
                  <strong>{selectedContestant.name}</strong> currently has{' '}
                  <strong>{selectedContestant.totalVotes.toLocaleString()}</strong> votes.
                </p>
                <form onSubmit={handleVoteAdjust} className={styles.form}>
                  <div className={styles.voteToggle}>
                    <button
                      type="button"
                      className={`${styles.voteToggleBtn} ${voteAction === 'add' ? styles.voteToggleActive : ''}`}
                      onClick={() => setVoteAction('add')}
                    >
                      <ChevronUp size={16} /> Add Votes
                    </button>
                    <button
                      type="button"
                      className={`${styles.voteToggleBtn} ${voteAction === 'deduct' ? styles.voteToggleActiveRed : ''}`}
                      onClick={() => setVoteAction('deduct')}
                    >
                      <ChevronDown size={16} /> Deduct Votes
                    </button>
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Number of Votes</label>
                    <input
                      type="number"
                      className={styles.input}
                      value={voteAmount}
                      onChange={(e) => setVoteAmount(Math.max(1, parseInt(e.target.value) || 1))}
                      min={1}
                      required
                    />
                  </div>
                  {error && <div className={styles.errorMsg}>{error}</div>}
                  <div className={styles.modalActions}>
                    <button type="button" className={styles.cancelBtn} onClick={closeModal}>Cancel</button>
                    <button type="submit" className={styles.submitBtn} disabled={loading}>
                      {loading ? 'Processing...' : `${voteAction === 'add' ? 'Add' : 'Deduct'} ${voteAmount} Vote(s)`}
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
