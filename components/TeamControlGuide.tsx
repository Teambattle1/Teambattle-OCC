import React, { useState, useEffect, useRef } from 'react';
import {
  Target,
  Users,
  Music,
  Clock,
  ClipboardList,
  MapPin,
  Car,
  Plane,
  Gamepad2,
  Home,
  ChevronDown,
  ChevronUp,
  Upload,
  X,
  Edit3,
  Save,
  ExternalLink,
  Play,
  Volume2
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import {
  getGuideSections,
  saveGuideSection,
  uploadGuideImage,
  GuideSection
} from '../lib/supabase';

// Default sections from the TeamControl instructor manual
const DEFAULT_SECTIONS = [
  {
    section_key: 'maalsaetning',
    title: 'MÅLSÆTNING & TEAMS',
    content: `TeamControl er en 3-delt aktivitet hvor deltagerne nørder med elektroniske fjernstyrede ting.

Der skal både køres med fjernstyrede RC-biler, bygges LEGO droner (FLYBRIX), og efterfølgende leges med selvbalancerende INDENDØRS droner.

TEAMOPDELING: 3-4 deltagere pr. team`,
    order_index: 0,
    icon: Target,
    color: 'red'
  },
  {
    section_key: 'musik',
    title: 'MUSIK TIL OPGAVEN',
    content: `Connect JBL musikafspiller med bluetooth til tablet eller telefon.

REGLER:
• Musik skal spille når gæsterne kommer
• Sluk under velkomst og fællesinstruktioner
• Hav altid musikken kørende når de arbejder
• Afspil MUSIK 3 (TOPGUN tema) 5 min før FLYBRIX konkurrence
• Tænd altid når der flyves

Links:
• Musik 1: l.ead.me/musik1
• Musik 3 (TOPGUN): l.ead.me/musik3`,
    order_index: 1,
    icon: Music,
    color: 'green',
    audioUrl: 'https://ilbjytyukicbssqftmma.supabase.co/storage/v1/object/public/guide-images/music/topgun-anthem.mp3',
    audioTitle: 'Top Gun Anthem'
  },
  {
    section_key: 'tidsplan',
    title: 'TIDSPLAN',
    content: `FØR OPGAVEN:
• 20 min - Forberedelse + Tjekliste AFGANG
• Opsætning af gear & bane

AFVIKLING (ca. 90 min):
• 15 min - Velkomst og TEAMS
• 05 min - Instruktion
• 20-25 min - DEL 1: RC-BATTLE
• 40-45 min - DEL 2: FLYBRIX
• 15-20 min - DEL 3: DRONE-BATTLE
• 02 min - Kåring af vinder

EFTER:
• 10 min - Oprydning
• 10 min - Tjekliste HJEMKOMST`,
    order_index: 2,
    icon: Clock,
    color: 'blue'
  },
  {
    section_key: 'foer_opgaven',
    title: 'FØR OPGAVEN',
    content: `FORBEREDELSE:
• Sæt batterier i RC biler og controllere hjemmefra
• Sæt clips på bilerne
• Sæt IKKE batterier i hvide droner (tænder selv under transport)

PAKKELISTE:
• BOX med LEGO drone kasser
• Kasse med ekstra LEGO "FLYBRIX EXTRA"
• Tablets med FlyBrix app
• Kasse med hvide droner
• Kasse med drone controllere
• 2 kasser med RC biler (8 stk)
• 1 kasse med RC GEAR + kegler
• Batterier til alt gear
• Orange helipad platform
• JBL Extreme 5 højtaler`,
    order_index: 3,
    icon: ClipboardList,
    color: 'yellow'
  },
  {
    section_key: 'ankomst',
    title: 'ANKOMST & OPSÆTNING',
    content: `1. Find konferencecrew eller kontaktperson
2. Få anvist lokale - tjek APP for aftaler
3. Er pladsen for lille? Find løsning FØR kunden kommer
4. SMS til kunden når du er ankommet
5. Tænd musik svagt som det første

OPSÆTNING:
• Sæt op til DEL 1 først
• GØR IKKE synligt klar til DEL 2+3 (skal være overraskelse)
• Hav "KIT" klar på instruktørbord til hurtig skift`,
    order_index: 4,
    icon: MapPin,
    color: 'purple'
  },
  {
    section_key: 'rc_battle',
    title: 'DEL 1: RC BATTLE',
    content: `GEAR:
• 2 boxe med 4 biler + controllere
• Match farvede strips på bil/controller
• Gearbox med kegler til bane

BANEOPBYGNING:
• 4 kegler til slalom (1m mellem)
• 1 PIT firkant (30x30cm) - hold stille 5 sek
• 5 stk storslalom
• 1 topkegle til 360° vending

ON/OFF:
• Controller: Knap bagerst (grøn = ON)
• Bil: Blå knap under cover
• VIGTIGT: Tjek 50% efter batteriskift!

KONKURRENCE:
• DRIVER 1 vender ryggen til banen
• ASSISTANT DRIVER guider gennem banen
• Rotation efter hver runde`,
    order_index: 5,
    icon: Car,
    color: 'orange'
  },
  {
    section_key: 'flybrix',
    title: 'DEL 2: FLYBRIX',
    content: `GEAR:
• LEGO drone kasser (1 pr team)
• Tablets med FlyBrix app
• EXTRABOX med reservedele

BYGGEFASE (25-30 min):
• Hver team bygger LEGO drone efter manual
• Tjek at farver på motorer matcher printet
• Propeller skal presse luft INDAD og NED

KONKURRENCE:
• Afspil TOPGUN tema 5 min før start
• Placer orange HELIPAD på gulvet
• Teams skal lette, flyve over 1 meter, lande sikkert
• Saml LEGO og batterier efter konkurrence`,
    order_index: 6,
    icon: Plane,
    color: 'blue'
  },
  {
    section_key: 'drone_battle',
    title: 'DEL 3: DRONE BATTLE',
    content: `GEAR:
• 1-2 kasser hvide droner (12-20 stk)
• 1 kasse controllere
• 10 gule pinde til bane

PARRING (VIGTIGT RÆKKEFØLGE):
1. Tryk knap på DRONE først
2. Derefter startknap på CONTROLLER
• Par IKKE på forhånd - gør det løbende

KONKURRENCE:
• Byg firkantet bane med 2 forhindringer
• Test først - gem 6+ droner til konkurrence
• Stafet: Flest omgange før batteri dør
• Ca. 10 min flyvning pr batteri

SIKKERHED:
• Pas på langhårede - skub drone væk
• Skruetrækker i GEARBOX til nødstilfælde`,
    order_index: 7,
    icon: Gamepad2,
    color: 'red'
  },
  {
    section_key: 'oprydning',
    title: 'OPRYDNING & HJEMKOMST',
    content: `TAG ALLE BATTERIER UD AF ALT!
• RC biler og controllere
• Droner og drone controllere
• LEGO boxe

EFTER HVER OPGAVE:
• Batterier der er brugt → til opladning
• Ubrugte batterier → forbliver i lukkede bokse
• Splitter til RC biler → læg i box
• Placer dele i korrekte boxe

HJEMKOMST TJEKLISTE:
• Alle batterier skal oplades
• Tjek drone batterier lader
• Tjek controller batterier lader
• Tablets til opladning
• Skriv fejl/mangler i evaluering
• Ring ved defekt gear!`,
    order_index: 8,
    icon: Home,
    color: 'green'
  }
];

const COLORS: Record<string, { bg: string; border: string; text: string; icon: string }> = {
  red: { bg: 'bg-red-500/10', border: 'border-red-500/30', text: 'text-red-400', icon: 'text-red-500' },
  green: { bg: 'bg-green-500/10', border: 'border-green-500/30', text: 'text-green-400', icon: 'text-green-500' },
  blue: { bg: 'bg-blue-500/10', border: 'border-blue-500/30', text: 'text-blue-400', icon: 'text-blue-500' },
  yellow: { bg: 'bg-yellow-500/10', border: 'border-yellow-500/30', text: 'text-yellow-400', icon: 'text-yellow-500' },
  purple: { bg: 'bg-purple-500/10', border: 'border-purple-500/30', text: 'text-purple-400', icon: 'text-purple-500' },
  orange: { bg: 'bg-orange-500/10', border: 'border-orange-500/30', text: 'text-orange-400', icon: 'text-orange-500' }
};

interface SectionWithMeta extends GuideSection {
  icon: React.ElementType;
  color: string;
  link?: string;
  linkText?: string;
  isInternal?: boolean;
  audioUrl?: string;
  audioTitle?: string;
}

interface TeamControlGuideProps {
  onNavigate?: (view: string) => void;
}

const TeamControlGuide: React.FC<TeamControlGuideProps> = ({ onNavigate }) => {
  const { profile } = useAuth();
  const [sections, setSections] = useState<SectionWithMeta[]>([]);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingSectionKey, setUploadingSectionKey] = useState<string | null>(null);

  const isAdmin = profile?.role === 'ADMIN' || profile?.role === 'GAMEMASTER';

  useEffect(() => {
    loadSections();
  }, []);

  const loadSections = async () => {
    setIsLoading(true);
    const result = await getGuideSections('teamcontrol');

    if (result.success && result.data && result.data.length > 0) {
      // Merge saved data with default metadata
      const mergedSections = DEFAULT_SECTIONS.map(defaultSection => {
        const savedSection = result.data?.find(s => s.section_key === defaultSection.section_key);
        const sectionWithOptionals = defaultSection as typeof defaultSection & { link?: string; linkText?: string; audioUrl?: string; audioTitle?: string };
        return {
          ...defaultSection,
          ...savedSection,
          activity: 'teamcontrol',
          icon: defaultSection.icon,
          color: defaultSection.color,
          link: sectionWithOptionals.link,
          linkText: sectionWithOptionals.linkText,
          audioUrl: sectionWithOptionals.audioUrl,
          audioTitle: sectionWithOptionals.audioTitle
        } as SectionWithMeta;
      });
      setSections(mergedSections);
    } else {
      // Use defaults with activity set
      setSections(DEFAULT_SECTIONS.map(s => ({
        ...s,
        activity: 'teamcontrol'
      } as SectionWithMeta)));
    }
    setIsLoading(false);
  };

  const handleToggleSection = (sectionKey: string) => {
    setExpandedSection(expandedSection === sectionKey ? null : sectionKey);
  };

  const handleStartEdit = (section: SectionWithMeta) => {
    setEditingSection(section.section_key);
    setEditContent(section.content);
  };

  const handleSaveEdit = async (section: SectionWithMeta) => {
    setIsSaving(true);
    const updatedSection = {
      ...section,
      content: editContent
    };

    const result = await saveGuideSection(updatedSection);
    if (result.success) {
      setSections(prev => prev.map(s =>
        s.section_key === section.section_key
          ? { ...s, content: editContent, id: result.id || s.id }
          : s
      ));
      setEditingSection(null);
    }
    setIsSaving(false);
  };

  const handleCancelEdit = () => {
    setEditingSection(null);
    setEditContent('');
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, sectionKey: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingSectionKey(sectionKey);
    const result = await uploadGuideImage(file, 'teamcontrol', sectionKey);

    if (result.success && result.url) {
      const section = sections.find(s => s.section_key === sectionKey);
      if (section) {
        const updatedSection = { ...section, image_url: result.url };
        const saveResult = await saveGuideSection(updatedSection);
        if (saveResult.success) {
          setSections(prev => prev.map(s =>
            s.section_key === sectionKey
              ? { ...s, image_url: result.url, id: saveResult.id || s.id }
              : s
          ));
        }
      }
    }
    setUploadingSectionKey(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const triggerImageUpload = (sectionKey: string) => {
    setUploadingSectionKey(sectionKey);
    fileInputRef.current?.click();
  };

  if (isLoading) {
    return (
      <div className="w-full max-w-6xl mx-auto flex items-center justify-center py-20">
        <div className="text-battle-orange text-lg uppercase tracking-widest">INDLÆSER GUIDE...</div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto px-2 tablet:px-4">
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/*"
        onChange={(e) => uploadingSectionKey && handleImageUpload(e, uploadingSectionKey)}
      />

      {/* 3x3 Grid */}
      <div className="grid grid-cols-1 tablet:grid-cols-3 gap-3 tablet:gap-4">
        {sections.map((section) => {
          const Icon = section.icon;
          const colorClasses = COLORS[section.color] || COLORS.blue;
          const isExpanded = expandedSection === section.section_key;
          const isEditing = editingSection === section.section_key;

          return (
            <div
              key={section.section_key}
              className={`rounded-xl border ${colorClasses.border} ${colorClasses.bg} overflow-hidden transition-all duration-300 ${
                isExpanded ? 'tablet:col-span-3 tablet:row-span-2' : ''
              }`}
            >
              {/* Header - Always visible */}
              <button
                onClick={() => handleToggleSection(section.section_key)}
                className="w-full p-3 tablet:p-4 flex items-center justify-between hover:bg-white/5 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${colorClasses.bg} border ${colorClasses.border}`}>
                    <Icon className={`w-5 h-5 tablet:w-6 tablet:h-6 ${colorClasses.icon}`} />
                  </div>
                  <h3 className={`text-sm tablet:text-base font-bold uppercase tracking-wider ${colorClasses.text}`}>
                    {section.title}
                  </h3>
                </div>
                {isExpanded ? (
                  <ChevronUp className={`w-5 h-5 ${colorClasses.text}`} />
                ) : (
                  <ChevronDown className={`w-5 h-5 ${colorClasses.text}`} />
                )}
              </button>

              {/* Expanded Content */}
              {isExpanded && (
                <div className="p-4 tablet:p-6 border-t border-white/10">
                  <div className="flex flex-col tablet:flex-row gap-4">
                    {/* Image Section */}
                    <div className="tablet:w-1/3">
                      {section.image_url ? (
                        <div className="relative group">
                          <img
                            src={section.image_url}
                            alt={section.title}
                            className="w-full h-48 tablet:h-64 object-cover rounded-lg"
                          />
                          {isAdmin && (
                            <button
                              onClick={() => triggerImageUpload(section.section_key)}
                              className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg"
                            >
                              <Upload className="w-8 h-8 text-white" />
                            </button>
                          )}
                        </div>
                      ) : (
                        <div
                          className={`w-full h-48 tablet:h-64 rounded-lg border-2 border-dashed ${colorClasses.border} flex flex-col items-center justify-center gap-2 ${
                            isAdmin ? 'cursor-pointer hover:bg-white/5' : ''
                          }`}
                          onClick={() => isAdmin && triggerImageUpload(section.section_key)}
                        >
                          <Icon className={`w-12 h-12 ${colorClasses.icon} opacity-30`} />
                          {isAdmin && (
                            <span className="text-xs text-gray-500 uppercase tracking-wider">
                              UPLOAD BILLEDE
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Content Section */}
                    <div className="tablet:w-2/3">
                      {isEditing ? (
                        <div className="space-y-3">
                          <textarea
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                            className="w-full h-64 bg-battle-black/50 border border-white/20 rounded-lg p-4 text-white text-sm leading-relaxed resize-none focus:outline-none focus:border-battle-orange"
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleSaveEdit(section)}
                              disabled={isSaving}
                              className="flex items-center gap-2 px-4 py-2 bg-green-500/20 border border-green-500/30 rounded-lg text-green-400 text-sm uppercase tracking-wider hover:bg-green-500/30 transition-colors disabled:opacity-50"
                            >
                              <Save className="w-4 h-4" />
                              {isSaving ? 'GEMMER...' : 'GEM'}
                            </button>
                            <button
                              onClick={handleCancelEdit}
                              className="flex items-center gap-2 px-4 py-2 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 text-sm uppercase tracking-wider hover:bg-red-500/30 transition-colors"
                            >
                              <X className="w-4 h-4" />
                              ANNULLER
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="relative">
                          <div className="text-sm tablet:text-base text-gray-300 whitespace-pre-line leading-relaxed">
                            {section.content}
                          </div>

                          {/* Audio Player */}
                          {section.audioUrl && (
                            <div className="mt-4 p-4 bg-battle-black/50 border border-green-500/30 rounded-xl">
                              <div className="flex items-center gap-3 mb-3">
                                <div className="p-2 bg-green-500/20 rounded-lg">
                                  <Volume2 className="w-5 h-5 text-green-400" />
                                </div>
                                <span className="text-sm font-bold text-green-400 uppercase tracking-wider">
                                  {section.audioTitle || 'Musik'}
                                </span>
                              </div>
                              <audio
                                controls
                                className="w-full h-10 rounded-lg"
                                style={{ filter: 'sepia(20%) saturate(70%) grayscale(1) contrast(99%) invert(12%)' }}
                              >
                                <source src={section.audioUrl} type="audio/mpeg" />
                                Din browser understøtter ikke audio afspilning.
                              </audio>
                            </div>
                          )}

                          {/* Action buttons */}
                          <div className="mt-4 flex flex-wrap gap-2">
                            {section.link && (
                              section.isInternal && onNavigate ? (
                                <button
                                  onClick={() => {
                                    const view = section.link?.replace('#', '') || '';
                                    onNavigate(view);
                                  }}
                                  className={`inline-flex items-center gap-2 px-4 py-2 ${colorClasses.bg} border ${colorClasses.border} rounded-lg ${colorClasses.text} text-xs uppercase tracking-wider hover:bg-white/10 transition-colors`}
                                >
                                  <ExternalLink className="w-4 h-4" />
                                  {section.linkText || 'ÅBEN'}
                                </button>
                              ) : (
                                <a
                                  href={section.link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className={`inline-flex items-center gap-2 px-4 py-2 ${colorClasses.bg} border ${colorClasses.border} rounded-lg ${colorClasses.text} text-xs uppercase tracking-wider hover:bg-white/10 transition-colors`}
                                >
                                  <ExternalLink className="w-4 h-4" />
                                  {section.linkText || 'ÅBEN LINK'}
                                </a>
                              )
                            )}
                            {isAdmin && (
                              <button
                                onClick={() => handleStartEdit(section)}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-battle-orange/20 border border-battle-orange/30 rounded-lg text-battle-orange text-xs uppercase tracking-wider hover:bg-battle-orange/30 transition-colors"
                              >
                                <Edit3 className="w-4 h-4" />
                                REDIGER
                              </button>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TeamControlGuide;
