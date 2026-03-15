import { useState, useRef, useCallback } from 'react';
import { THEME, S } from '@/styles/theme';
import {
  PHOTO_BACKDROPS, PHOTO_LIGHTING, POSES, LEGENDARY_SETS,
  type AvatarConfig, type EquippedItems, DEFAULT_AVATAR, DEFAULT_EQUIPPED,
} from '@/lib/avatarData';
import { CREW_MEMBERS } from '@/lib/gameData';
import Avatar from '@/components/Avatar';
import { toast } from '@/hooks/use-toast';

interface PhotoModeScreenProps {
  avatarConfig?: AvatarConfig;
  equippedItems?: EquippedItems;
  profileData?: {
    notoriety_title?: string;
    rep_level?: number;
    jewels?: Record<string, number>;
  };
  heistStats?: {
    successRate?: number;
    bestHeist?: number;
  };
  unlockedCrewIds?: string[];
  completedSets?: string[];
  onBack: () => void;
}

const JEWEL_DOTS: Record<string, string> = {
  pearl: '🤍', sapphire: '💙', emerald: '💚', ruby: '❤️', diamond: '💎',
};

const PhotoModeScreen = ({
  avatarConfig = DEFAULT_AVATAR,
  equippedItems = DEFAULT_EQUIPPED,
  profileData = {},
  heistStats = {},
  unlockedCrewIds = ['brick', 'silk', 'ghost'],
  completedSets = [],
  onBack,
}: PhotoModeScreenProps) => {
  const sceneRef = useRef<HTMLDivElement>(null);
  const [selectedBackdrop, setSelectedBackdrop] = useState(PHOTO_BACKDROPS[0]);
  const [selectedLighting, setSelectedLighting] = useState(PHOTO_LIGHTING[0]);
  const [selectedPose, setSelectedPose] = useState('the_lean');
  const [crewInScene, setCrewInScene] = useState<string[]>([]);
  const [overlayText, setOverlayText] = useState(false);
  const [statsCard, setStatsCard] = useState(false);
  const [customText, setCustomText] = useState('');
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [capturedBlob, setCapturedBlob] = useState<Blob | null>(null);
  const [capturing, setCapturing] = useState(false);

  const sceneWidth = Math.min(typeof window !== 'undefined' ? window.innerWidth : 360, 480);
  const sceneHeight = sceneWidth;

  const toggleCrew = (id: string) => {
    setCrewInScene(prev => {
      if (prev.includes(id)) return prev.filter(c => c !== id);
      if (prev.length >= 3) return [...prev.slice(1), id];
      return [...prev, id];
    });
  };

  const isPoseUnlocked = (pose: typeof POSES[number]) => {
    if (pose.tier === 'standard') return true;
    return completedSets.includes((pose as any).setId);
  };

  const handleCapture = useCallback(async () => {
    if (!sceneRef.current || capturing) return;
    setCapturing(true);
    try {
      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(sceneRef.current, {
        scale: 3,
        useCORS: true,
        backgroundColor: null,
      });
      canvas.toBlob((blob) => {
        if (blob) {
          setCapturedBlob(blob);
          setShareModalOpen(true);
        }
        setCapturing(false);
      }, 'image/png');
    } catch {
      setCapturing(false);
      toast({ title: 'Capture failed', description: 'Could not generate image.' });
    }
  }, [capturing]);

  const handleDownload = () => {
    if (!capturedBlob) return;
    const url = URL.createObjectURL(capturedBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'heist-card.png';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopy = async () => {
    if (!capturedBlob) return;
    try {
      await navigator.clipboard.write([new ClipboardItem({ 'image/png': capturedBlob })]);
      toast({ title: 'COPIED', description: 'Image copied to clipboard.' });
    } catch {
      toast({ title: 'Copy failed', description: 'Clipboard access denied.' });
    }
  };

  const handleShare = async () => {
    if (!capturedBlob || !navigator.share) return;
    try {
      await navigator.share({
        files: [new File([capturedBlob], 'heist-card.png', { type: 'image/png' })],
      });
    } catch { /* user cancelled */ }
  };

  // Crew positioning
  const crewPositions = (count: number): { left: string; bottom: number }[] => {
    switch (count) {
      case 1: return [{ left: '8%', bottom: 0 }];
      case 2: return [{ left: '5%', bottom: 0 }, { left: '78%', bottom: 0 }];
      case 3: return [{ left: '2%', bottom: 0 }, { left: '36%', bottom: 0 }, { left: '78%', bottom: 0 }];
      default: return [];
    }
  };

  // Building silhouette SVG
  const buildingSilhouette = (accentColor: string) => (
    <svg width="100%" height="100%" viewBox="0 0 480 480" preserveAspectRatio="none" style={{ position: 'absolute', bottom: 0, left: 0 }}>
      <rect x={20} y={320} width={50} height={160} fill={accentColor} opacity={0.15} />
      <rect x={80} y={280} width={40} height={200} fill={accentColor} opacity={0.12} />
      <rect x={140} y={340} width={60} height={140} fill={accentColor} opacity={0.1} />
      <rect x={220} y={260} width={35} height={220} fill={accentColor} opacity={0.14} />
      <rect x={270} y={310} width={55} height={170} fill={accentColor} opacity={0.11} />
      <rect x={340} y={290} width={45} height={190} fill={accentColor} opacity={0.13} />
      <rect x={400} y={330} width={60} height={150} fill={accentColor} opacity={0.1} />
    </svg>
  );

  const unlockedCrew = CREW_MEMBERS.filter(c => unlockedCrewIds.includes(c.id));
  const crewPos = crewPositions(crewInScene.length);

  return (
    <div style={{ minHeight: '100vh', background: THEME.colors.void, display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderBottom: `1px solid ${THEME.colors.borderFaint}` }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', color: THEME.colors.goldMid, fontFamily: THEME.fonts.display, fontSize: 13, letterSpacing: 2, cursor: 'pointer' }}>
          ← BACK
        </button>
        <span style={{ fontFamily: THEME.fonts.display, color: THEME.colors.textPrimary, fontSize: 14, letterSpacing: 3 }}>
          📸 PHOTO MODE
        </span>
        <div style={{ width: 60 }} />
      </div>

      {/* ZONE A: Scene Canvas */}
      <div
        ref={sceneRef}
        style={{
          position: 'relative',
          width: sceneWidth,
          height: sceneHeight,
          maxWidth: 480,
          margin: '0 auto',
          overflow: 'hidden',
          background: `linear-gradient(180deg, ${selectedBackdrop.bgColor} 0%, ${selectedBackdrop.bgColor}DD 100%)`,
          filter: selectedLighting.cssFilter,
        }}
      >
        {/* Backdrop buildings */}
        {buildingSilhouette(selectedBackdrop.accentColor)}

        {/* Lighting overlay */}
        <div style={{ position: 'absolute', inset: 0, background: selectedLighting.overlay, pointerEvents: 'none' }} />

        {/* Crew members */}
        {crewInScene.map((cid, i) => {
          const crew = CREW_MEMBERS.find(c => c.id === cid);
          if (!crew || !crewPos[i]) return null;
          return (
            <div key={cid} style={{
              position: 'absolute',
              bottom: crewPos[i].bottom,
              left: crewPos[i].left,
              width: 60,
              height: 80,
              background: 'rgba(13,10,18,0.85)',
              borderRadius: 6,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              border: `1px solid ${THEME.colors.borderFaint}`,
              transition: 'opacity 0.2s ease',
            }}>
              <span style={{ fontSize: 28 }}>{crew.emoji}</span>
              <span style={{ fontFamily: THEME.fonts.display, fontSize: 8, color: THEME.colors.textSecondary, marginTop: 4, textAlign: 'center' }}>{crew.name}</span>
            </div>
          );
        })}

        {/* Player avatar */}
        <div style={{ position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)' }}>
          <Avatar avatarConfig={avatarConfig} equippedItems={equippedItems} pose={selectedPose} size={160} showGlow={completedSets.length > 0} />
        </div>

        {/* Text overlay */}
        {overlayText && (
          <div style={{ position: 'absolute', bottom: 8, left: 0, right: 0, textAlign: 'center', pointerEvents: 'none' }}>
            <div style={{ fontFamily: THEME.fonts.display, fontSize: 14, color: THEME.colors.goldMid, letterSpacing: 2 }}>
              {profileData.notoriety_title || 'UNKNOWN'}
            </div>
            {customText && (
              <div style={{ fontFamily: THEME.fonts.body, fontStyle: 'italic', fontSize: 11, color: THEME.colors.textSecondary, marginTop: 2 }}>
                {customText}
              </div>
            )}
          </div>
        )}

        {/* Stats card */}
        {statsCard && (
          <div style={{
            position: 'absolute', bottom: 8, right: 8, width: 90, padding: '6px 8px',
            background: 'rgba(13,10,18,0.9)', borderRadius: 4, border: `1px solid ${THEME.colors.borderFaint}`,
          }}>
            <div style={{ fontFamily: THEME.fonts.display, fontSize: 10, color: THEME.colors.goldMid }}>
              REP {profileData.rep_level || 1}
            </div>
            <div style={{ fontFamily: THEME.fonts.display, fontSize: 9, color: '#00C853' }}>
              {heistStats.successRate || 0}% CLEAN
            </div>
            <div style={{ fontFamily: THEME.fonts.display, fontSize: 9, color: THEME.colors.goldMid }}>
              BEST: ${(heistStats.bestHeist || 0).toLocaleString()}
            </div>
            {profileData.jewels && (
              <div style={{ marginTop: 2 }}>
                {Object.entries(profileData.jewels).filter(([, v]) => v > 0).map(([k]) => (
                  <span key={k} style={{ fontSize: 8 }}>{JEWEL_DOTS[k] || '💎'}</span>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Watermark */}
        <div style={{ position: 'absolute', bottom: 4, left: 8, fontFamily: THEME.fonts.display, fontSize: 8, color: 'rgba(255,255,255,0.25)', letterSpacing: 1 }}>
          THE GIFT HEIST
        </div>
      </div>

      {/* ZONE B: Controls */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px', paddingBottom: 80 }}>
        {/* Backdrop row */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ ...S.eyebrow, marginBottom: 8 }}>BACKDROP</div>
          <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
            {PHOTO_BACKDROPS.map(b => (
              <button key={b.id} onClick={() => setSelectedBackdrop(b)} style={{
                flexShrink: 0, width: 56, border: selectedBackdrop.id === b.id ? `2px solid ${THEME.colors.goldMid}` : `1px solid ${THEME.colors.borderFaint}`,
                borderRadius: 4, background: 'none', padding: 0, cursor: 'pointer',
              }}>
                <div style={{ width: '100%', height: 40, background: b.bgColor, borderRadius: 3, position: 'relative' }}>
                  <div style={{ position: 'absolute', bottom: 4, right: 4, width: 8, height: 8, borderRadius: '50%', background: b.accentColor }} />
                </div>
                <div style={{ fontFamily: THEME.fonts.display, fontSize: 8, color: THEME.colors.textMuted, marginTop: 2, textAlign: 'center', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', padding: '0 2px' }}>
                  {b.label}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Lighting row */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ ...S.eyebrow, marginBottom: 8 }}>LIGHTING</div>
          <div style={{ display: 'flex', gap: 8 }}>
            {PHOTO_LIGHTING.map(l => (
              <button key={l.id} onClick={() => setSelectedLighting(l)} style={{
                padding: '6px 14px', borderRadius: 20, cursor: 'pointer', fontFamily: THEME.fonts.display, fontSize: 11, letterSpacing: 1,
                background: selectedLighting.id === l.id ? THEME.colors.goldMid : THEME.colors.cardBg,
                color: selectedLighting.id === l.id ? THEME.colors.void : THEME.colors.textSecondary,
                border: selectedLighting.id === l.id ? 'none' : `1px solid ${THEME.colors.borderFaint}`,
              }}>
                {l.label}
              </button>
            ))}
          </div>
        </div>

        {/* Pose row */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ ...S.eyebrow, marginBottom: 8 }}>POSE</div>
          <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
            {POSES.map(p => {
              const unlocked = isPoseUnlocked(p);
              const active = selectedPose === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => {
                    if (unlocked) setSelectedPose(p.id);
                    else toast({ title: '🔒 Locked', description: (p as any).unlockNote || 'Complete a legendary set' });
                  }}
                  style={{
                    flexShrink: 0, width: 48, height: 64, borderRadius: 4, cursor: 'pointer',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    background: p.tier === 'legendary' && unlocked ? 'rgba(232,184,75,0.15)' : THEME.colors.dusk,
                    border: active ? `2px solid ${THEME.colors.goldMid}` : `1px solid ${THEME.colors.borderFaint}`,
                    opacity: unlocked ? 1 : 0.5,
                    position: 'relative',
                  }}
                >
                  {!unlocked && <span style={{ fontSize: 16 }}>🔒</span>}
                  <span style={{ fontFamily: THEME.fonts.display, fontSize: 8, color: THEME.colors.textSecondary, textAlign: 'center', marginTop: 2, lineHeight: 1.2 }}>
                    {p.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Crew row */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ ...S.eyebrow, marginBottom: 8 }}>ADD CREW (UP TO 3)</div>
          <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
            {unlockedCrew.map(c => {
              const active = crewInScene.includes(c.id);
              return (
                <button key={c.id} onClick={() => toggleCrew(c.id)} style={{
                  flexShrink: 0, width: 56, height: 72, borderRadius: 6, cursor: 'pointer',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  background: THEME.colors.dusk, position: 'relative',
                  border: active ? `2px solid ${THEME.colors.goldMid}` : `1px solid ${THEME.colors.borderFaint}`,
                }}>
                  <span style={{ fontSize: 24 }}>{c.emoji}</span>
                  <span style={{ fontFamily: THEME.fonts.display, fontSize: 8, color: THEME.colors.textSecondary, marginTop: 4 }}>{c.name}</span>
                  {active && <span style={{ position: 'absolute', top: 2, right: 2, fontSize: 10, color: THEME.colors.goldMid }}>✓</span>}
                </button>
              );
            })}
          </div>
        </div>

        {/* Overlays row */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ ...S.eyebrow, marginBottom: 8 }}>OVERLAYS</div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={() => setOverlayText(!overlayText)} style={{
              padding: '6px 14px', borderRadius: 20, cursor: 'pointer', fontFamily: THEME.fonts.display, fontSize: 11, letterSpacing: 1,
              background: overlayText ? THEME.colors.goldMid : THEME.colors.cardBg,
              color: overlayText ? THEME.colors.void : THEME.colors.textSecondary,
              border: overlayText ? 'none' : `1px solid ${THEME.colors.borderFaint}`,
            }}>
              TITLE CARD
            </button>
            <button onClick={() => setStatsCard(!statsCard)} style={{
              padding: '6px 14px', borderRadius: 20, cursor: 'pointer', fontFamily: THEME.fonts.display, fontSize: 11, letterSpacing: 1,
              background: statsCard ? THEME.colors.goldMid : THEME.colors.cardBg,
              color: statsCard ? THEME.colors.void : THEME.colors.textSecondary,
              border: statsCard ? 'none' : `1px solid ${THEME.colors.borderFaint}`,
            }}>
              STATS CARD
            </button>
          </div>
          {overlayText && (
            <input
              type="text"
              maxLength={30}
              value={customText}
              onChange={e => setCustomText(e.target.value)}
              placeholder="Add a line..."
              style={{
                marginTop: 8, width: '100%', padding: '8px 12px', borderRadius: 6,
                background: THEME.colors.cardBg, border: `1px solid ${THEME.colors.borderFaint}`,
                color: THEME.colors.textPrimary, fontFamily: THEME.fonts.body, fontSize: 13,
                outline: 'none',
              }}
            />
          )}
        </div>
      </div>

      {/* Capture button */}
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, padding: '12px 16px',
        paddingBottom: 'max(12px, env(safe-area-inset-bottom))',
        background: `linear-gradient(transparent, ${THEME.colors.void})`,
      }}>
        <button
          onClick={handleCapture}
          disabled={capturing}
          style={{
            width: '100%', height: 52, borderRadius: 8, border: 'none', cursor: capturing ? 'wait' : 'pointer',
            background: capturing ? THEME.colors.cardBg : THEME.colors.goldMid,
            color: capturing ? THEME.colors.textMuted : THEME.colors.void,
            fontFamily: THEME.fonts.display, fontSize: 15, letterSpacing: 3,
          }}
        >
          {capturing ? 'CAPTURING...' : '📸 CAPTURE'}
        </button>
      </div>

      {/* Share modal */}
      {shareModalOpen && capturedBlob && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 100,
          background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
        }} onClick={() => setShareModalOpen(false)}>
          <div
            onClick={e => e.stopPropagation()}
            style={{
              width: '100%', maxWidth: 480, background: THEME.colors.cardBg,
              borderRadius: '16px 16px 0 0', padding: '20px 20px max(20px, env(safe-area-inset-bottom))',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12,
            }}
          >
            <div style={{ fontFamily: THEME.fonts.display, fontSize: 16, color: THEME.colors.goldMid, letterSpacing: 3 }}>
              YOUR HEIST CARD
            </div>
            <img
              src={URL.createObjectURL(capturedBlob)}
              alt="Heist card"
              style={{ width: '80%', borderRadius: 6, border: `1px solid ${THEME.colors.borderFaint}` }}
            />
            <button onClick={handleDownload} style={{
              width: '100%', padding: '12px 0', borderRadius: 8, border: 'none', cursor: 'pointer',
              background: THEME.colors.goldMid, color: THEME.colors.void,
              fontFamily: THEME.fonts.display, fontSize: 13, letterSpacing: 2,
            }}>
              ⬇ DOWNLOAD
            </button>
            <button onClick={handleCopy} style={{
              width: '100%', padding: '12px 0', borderRadius: 8, border: `1px solid ${THEME.colors.goldMid}`,
              background: 'transparent', color: THEME.colors.goldMid, cursor: 'pointer',
              fontFamily: THEME.fonts.display, fontSize: 13, letterSpacing: 2,
            }}>
              📋 COPY IMAGE
            </button>
            {typeof navigator !== 'undefined' && navigator.share ? (
              <button onClick={handleShare} style={{
                width: '100%', padding: '12px 0', borderRadius: 8, border: `1px solid ${THEME.colors.goldMid}`,
                background: 'transparent', color: THEME.colors.goldMid, cursor: 'pointer',
                fontFamily: THEME.fonts.display, fontSize: 13, letterSpacing: 2,
              }}>
                📤 SHARE
              </button>
            ) : (
              <div style={{ fontFamily: THEME.fonts.display, fontSize: 11, color: THEME.colors.textMuted }}>
                Share not available on this browser
              </div>
            )}
            <button onClick={() => setShareModalOpen(false)} style={{
              background: 'none', border: 'none', color: THEME.colors.textMuted, cursor: 'pointer',
              fontFamily: THEME.fonts.display, fontSize: 12, letterSpacing: 2, marginTop: 4,
            }}>
              CLOSE
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PhotoModeScreen;
