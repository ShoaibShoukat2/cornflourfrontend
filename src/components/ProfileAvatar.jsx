import { useContext, useRef, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../api/axios';
import defaultLogo from '../assets/tasklogo.jpeg';

const SIZES = {
  sm: { wrap: 'w-7 h-7', text: 'text-xs' },
  md: { wrap: 'w-10 h-10', text: 'text-sm' },
  lg: { wrap: 'w-[5.5rem] h-[5.5rem]', text: 'text-2xl' },
  xl: { wrap: 'w-24 h-24', text: 'text-3xl' },
};

const ProfileAvatar = ({
  size = 'lg',
  editable = false,
  ring = true,
  className = '',
  onUploadDone,
}) => {
  const { user, fetchUser } = useContext(AuthContext);
  const fileRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const dims = SIZES[size] || SIZES.lg;
  const src = user?.profile_picture;
  const initial = user?.username?.charAt(0)?.toUpperCase() || '?';

  const handlePick = () => {
    if (editable && !uploading) fileRef.current?.click();
  };

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    setError('');
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file (JPG, PNG, WebP)');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setError('Image must be under 2MB');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = async () => {
      setUploading(true);
      try {
        const res = await api.post('/auth/upload-profile-picture/', {
          profile_picture: reader.result,
        });
        if (res.data.user) {
          await fetchUser();
        }
        onUploadDone?.(res.data.message);
      } catch (err) {
        setError(err.response?.data?.error || 'Upload failed');
      } finally {
        setUploading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemove = async (e) => {
    e.stopPropagation();
    setError('');
    setUploading(true);
    try {
      await api.post('/auth/remove-profile-picture/');
      await fetchUser();
      onUploadDone?.('Profile picture removed');
    } catch (err) {
      setError(err.response?.data?.error || 'Could not remove photo');
    } finally {
      setUploading(false);
    }
  };

  const wrapCls = [
    'profile-avatar',
    ring ? 'profile-avatar-ring' : '',
    dims.wrap,
    editable ? 'profile-avatar-editable' : '',
    uploading ? 'profile-avatar-loading' : '',
    className,
  ].filter(Boolean).join(' ');

  const inner = (
    <>
      {src ? (
        <img src={src} alt={user?.username || 'Profile'} className="profile-avatar-img" />
      ) : size === 'sm' || size === 'md' ? (
        <img src={defaultLogo} alt="" className="profile-avatar-img" />
      ) : (
        <span className={`profile-avatar-fallback ${dims.text}`}>{initial}</span>
      )}
      {editable && (
        <span className="profile-avatar-badge" aria-hidden="true">
          {uploading ? '…' : '📷'}
        </span>
      )}
    </>
  );

  return (
    <section className="profile-avatar-container">
      {editable ? (
        <button
          type="button"
          className={wrapCls}
          onClick={handlePick}
          disabled={uploading}
          aria-label="Change profile picture"
        >
          {inner}
        </button>
      ) : (
        <section className={wrapCls} aria-label={user?.username}>
          {inner}
        </section>
      )}

      {editable && (
        <>
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="hidden"
            onChange={handleFile}
          />
          {src && (
            <button type="button" className="profile-avatar-remove text-xs mt-2" onClick={handleRemove} disabled={uploading}>
              Remove photo
            </button>
          )}
        </>
      )}

      {error && <p className="profile-avatar-error">{error}</p>}
    </section>
  );
};

export default ProfileAvatar;
