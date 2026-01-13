import React, { useState, useEffect } from 'react';
import { Package, CheckCircle2, Circle, RotateCcw, Plane, Home } from 'lucide-react';

interface PackingItem {
  id: string;
  text: string;
  indent?: boolean;
}

const AFGANG_ITEMS: PackingItem[] = [
  { id: 'a1', text: 'Rør (2,5 til hver gruppe)' },
  { id: 'a2', text: 'Rundpinde (3 pinde til hvert hold)' },
  { id: 'a3', text: 'Sorte/gule Construct kasser (en til hvert hold) med:' },
  { id: 'a4', text: 'En golfbold', indent: true },
  { id: 'a5', text: 'Et skærebræt', indent: true },
  { id: 'a6', text: 'En sav', indent: true },
  { id: 'a7', text: 'Skærehandsker', indent: true },
  { id: 'a8', text: 'Målebånd', indent: true },
  { id: 'a9', text: 'Gaffatape', indent: true },
  { id: 'a10', text: 'Manual til hvad de skal konstruere', indent: true },
  { id: 'a11', text: 'Gul gearkasse med:' },
  { id: 'a12', text: 'Skemaer', indent: true },
  { id: 'a13', text: 'Kuglepen', indent: true },
  { id: 'a14', text: 'Ekstra golfbolde', indent: true },
  { id: 'a15', text: 'Ekstra gaffa', indent: true },
  { id: 'a16', text: 'Ekstra målebånd', indent: true },
  { id: 'a17', text: 'Ekstra skærehandsker', indent: true },
  { id: 'a18', text: 'Sorte borde (en til hvert hold)' },
  { id: 'a19', text: 'Højtaler' },
];

const HJEMKOMST_ITEMS: PackingItem[] = [
  { id: 'h1', text: 'Gearet skal virke og være klar til næste bruger' },
  { id: 'h2', text: 'Vådt gear ordnes med det samme ved retur' },
  { id: 'h3', text: 'Brugte pointskemaer smides ud – nye sættes i' },
  { id: 'h4', text: 'Skrald og "stumper" smides ud' },
  { id: 'h5', text: 'Rør og brugbare "afskæringer" gemmes' },
  { id: 'h6', text: 'Gearkasser fyldes op efter behov' },
  { id: 'h7', text: 'Fejl/mangler skrives i evalueringen' },
  { id: 'h8', text: 'Ring ved defekt gear der påvirker næste opgave' },
];

interface PackingListProps {
  mode: 'afgang' | 'hjemkomst';
}

const TeamConstructPackingList: React.FC<PackingListProps> = ({ mode }) => {
  const items = mode === 'afgang' ? AFGANG_ITEMS : HJEMKOMST_ITEMS;
  const storageKey = `teamconstruct_packing_${mode}`;

  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());

  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        setCheckedItems(new Set(JSON.parse(saved)));
      } catch (e) {
        console.error('Failed to load packing list:', e);
      }
    }
  }, [storageKey]);

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify([...checkedItems]));
  }, [checkedItems, storageKey]);

  const toggleItem = (id: string) => {
    setCheckedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const resetAll = () => {
    if (confirm('Nulstil alle checkmarks?')) {
      setCheckedItems(new Set());
    }
  };

  const checkAll = () => {
    setCheckedItems(new Set(items.map(i => i.id)));
  };

  const progress = (checkedItems.size / items.length) * 100;
  const Icon = mode === 'afgang' ? Plane : Home;

  return (
    <div className="w-full max-w-2xl mx-auto px-2 tablet:px-4">
      <div className="bg-battle-grey/20 border border-white/10 rounded-xl tablet:rounded-2xl p-4 tablet:p-6 backdrop-blur-sm">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 tablet:mb-6">
          <div className="flex items-center gap-3">
            <Icon className="w-6 h-6 tablet:w-8 tablet:h-8 text-battle-orange" />
            <div>
              <h2 className="text-base tablet:text-xl font-bold text-white uppercase tracking-wider">
                {mode === 'afgang' ? 'PAKKELISTE AFGANG' : 'HUSKELISTE HJEMKOMST'}
              </h2>
              <p className="text-[10px] tablet:text-xs text-gray-500 uppercase">TeamConstruct</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={checkAll}
              className="flex items-center gap-1 px-2 tablet:px-3 py-1.5 bg-green-500/20 border border-green-500/30 rounded-lg text-green-400 text-xs uppercase hover:bg-green-500/30 transition-colors"
            >
              <CheckCircle2 className="w-3 h-3 tablet:w-4 tablet:h-4" />
            </button>
            <button
              onClick={resetAll}
              className="flex items-center gap-1 px-2 tablet:px-3 py-1.5 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 text-xs uppercase hover:bg-red-500/30 transition-colors"
            >
              <RotateCcw className="w-3 h-3 tablet:w-4 tablet:h-4" />
            </button>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mb-4 tablet:mb-6">
          <div className="flex justify-between text-xs text-gray-400 mb-1">
            <span>{checkedItems.size} / {items.length}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="h-2 bg-battle-black/50 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${
                progress === 100 ? 'bg-green-500' : 'bg-battle-orange'
              }`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Items */}
        <div className="space-y-2">
          {items.map((item) => {
            const isChecked = checkedItems.has(item.id);
            return (
              <button
                key={item.id}
                onClick={() => toggleItem(item.id)}
                className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-all ${
                  item.indent ? 'ml-4 tablet:ml-6' : ''
                } ${
                  isChecked
                    ? 'bg-green-500/20 border border-green-500/30'
                    : 'bg-battle-black/30 border border-white/5 hover:border-white/20'
                }`}
              >
                {isChecked ? (
                  <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />
                ) : (
                  <Circle className="w-5 h-5 text-gray-600 flex-shrink-0" />
                )}
                <span className={`text-sm tablet:text-base ${
                  isChecked ? 'text-green-400 line-through' : 'text-white'
                }`}>
                  {item.text}
                </span>
              </button>
            );
          })}
        </div>

        {/* Completion message */}
        {progress === 100 && (
          <div className="mt-4 tablet:mt-6 p-3 bg-green-500/20 border border-green-500/30 rounded-xl text-center">
            <CheckCircle2 className="w-8 h-8 text-green-400 mx-auto mb-2" />
            <div className="text-lg font-bold text-green-400 uppercase">
              {mode === 'afgang' ? 'KLAR TIL AFGANG!' : 'FÆRDIG!'}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeamConstructPackingList;
