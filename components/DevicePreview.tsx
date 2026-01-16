import React, { useState, useEffect } from 'react';
import {
  Smartphone,
  Tablet,
  Monitor,
  RotateCcw,
  X,
  Eye,
  EyeOff,
  Save
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

// Device configurations
export type DeviceType = 'mobile' | 'tablet' | 'desktop';
export type Orientation = 'portrait' | 'landscape';

interface DeviceConfig {
  name: string;
  icon: React.ElementType;
  portrait: { width: number; height: number };
  landscape: { width: number; height: number };
}

const DEVICES: Record<DeviceType, DeviceConfig> = {
  mobile: {
    name: 'Mobil',
    icon: Smartphone,
    portrait: { width: 390, height: 844 },   // iPhone 14 Pro
    landscape: { width: 844, height: 390 }
  },
  tablet: {
    name: 'Tablet',
    icon: Tablet,
    portrait: { width: 820, height: 1180 },  // iPad Air
    landscape: { width: 1180, height: 820 }
  },
  desktop: {
    name: 'Desktop',
    icon: Monitor,
    portrait: { width: 1920, height: 1080 }, // Full HD
    landscape: { width: 1920, height: 1080 }
  }
};

// Get current device/orientation from localStorage or detect
export const getStoredDevicePreference = (): { device: DeviceType; orientation: Orientation } | null => {
  try {
    const stored = localStorage.getItem('devicePreviewPreference');
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
};

export const setStoredDevicePreference = (device: DeviceType, orientation: Orientation) => {
  try {
    localStorage.setItem('devicePreviewPreference', JSON.stringify({ device, orientation }));
  } catch {
    // Ignore localStorage errors
  }
};

// Detect actual device
export const detectDevice = (): { device: DeviceType; orientation: Orientation } => {
  const width = window.innerWidth;
  const height = window.innerHeight;
  const orientation: Orientation = width > height ? 'landscape' : 'portrait';

  let device: DeviceType = 'desktop';
  if (width <= 480 || (width <= 844 && orientation === 'landscape' && height <= 480)) {
    device = 'mobile';
  } else if (width <= 1024) {
    device = 'tablet';
  }

  return { device, orientation };
};

// Context for device preview state
interface DevicePreviewContextType {
  previewDevice: DeviceType | null;
  previewOrientation: Orientation | null;
  isPreviewMode: boolean;
  actualDevice: DeviceType;
  actualOrientation: Orientation;
  effectiveDevice: DeviceType;
  effectiveOrientation: Orientation;
}

export const DevicePreviewContext = React.createContext<DevicePreviewContextType>({
  previewDevice: null,
  previewOrientation: null,
  isPreviewMode: false,
  actualDevice: 'desktop',
  actualOrientation: 'landscape',
  effectiveDevice: 'desktop',
  effectiveOrientation: 'landscape'
});

export const useDevicePreview = () => React.useContext(DevicePreviewContext);

interface DevicePreviewToolbarProps {
  onDeviceChange?: (device: DeviceType, orientation: Orientation) => void;
}

export const DevicePreviewToolbar: React.FC<DevicePreviewToolbarProps> = ({ onDeviceChange }) => {
  const { profile } = useAuth();
  const [selectedDevice, setSelectedDevice] = useState<DeviceType | null>(null);
  const [selectedOrientation, setSelectedOrientation] = useState<Orientation>('portrait');
  const [isPreviewActive, setIsPreviewActive] = useState(false);

  const isAdmin = profile?.role === 'ADMIN' || profile?.role === 'GAMEMASTER';

  if (!isAdmin) return null;

  const handleDeviceSelect = (device: DeviceType) => {
    setSelectedDevice(device);
    if (isPreviewActive) {
      onDeviceChange?.(device, selectedOrientation);
    }
  };

  const handleOrientationToggle = () => {
    const newOrientation = selectedOrientation === 'portrait' ? 'landscape' : 'portrait';
    setSelectedOrientation(newOrientation);
    if (isPreviewActive && selectedDevice) {
      onDeviceChange?.(selectedDevice, newOrientation);
    }
  };

  const handlePreviewToggle = () => {
    if (!isPreviewActive && selectedDevice) {
      setIsPreviewActive(true);
      onDeviceChange?.(selectedDevice, selectedOrientation);
    } else {
      setIsPreviewActive(false);
      onDeviceChange?.(detectDevice().device, detectDevice().orientation);
    }
  };

  return (
    <div className="fixed top-2 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-2 px-3 py-2 bg-battle-grey/95 backdrop-blur-sm border border-white/20 rounded-full shadow-lg">
      {/* Device Selection */}
      <div className="flex items-center gap-1">
        {(Object.keys(DEVICES) as DeviceType[]).map((deviceKey) => {
          const device = DEVICES[deviceKey];
          const DeviceIcon = device.icon;
          const isSelected = selectedDevice === deviceKey;

          return (
            <button
              key={deviceKey}
              onClick={() => handleDeviceSelect(deviceKey)}
              className={`p-2 rounded-lg transition-all ${
                isSelected
                  ? 'bg-battle-orange text-white'
                  : 'text-gray-400 hover:text-white hover:bg-white/10'
              }`}
              title={device.name}
            >
              <DeviceIcon className="w-4 h-4" />
            </button>
          );
        })}
      </div>

      {/* Divider */}
      <div className="w-px h-6 bg-white/20" />

      {/* Orientation Toggle */}
      <button
        onClick={handleOrientationToggle}
        disabled={!selectedDevice}
        className={`p-2 rounded-lg transition-all ${
          selectedDevice
            ? 'text-gray-400 hover:text-white hover:bg-white/10'
            : 'text-gray-600 cursor-not-allowed'
        } ${selectedOrientation === 'landscape' ? 'rotate-90' : ''}`}
        title={selectedOrientation === 'portrait' ? 'Skift til landscape' : 'Skift til portrait'}
      >
        <RotateCcw className="w-4 h-4" />
      </button>

      {/* Divider */}
      <div className="w-px h-6 bg-white/20" />

      {/* Preview Toggle */}
      <button
        onClick={handlePreviewToggle}
        disabled={!selectedDevice}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs uppercase tracking-wider font-medium transition-all ${
          isPreviewActive
            ? 'bg-green-500/20 text-green-400 border border-green-500/30'
            : selectedDevice
              ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30 hover:bg-blue-500/30'
              : 'bg-gray-500/20 text-gray-500 border border-gray-500/30 cursor-not-allowed'
        }`}
      >
        {isPreviewActive ? (
          <>
            <EyeOff className="w-3 h-3" />
            Stop
          </>
        ) : (
          <>
            <Eye className="w-3 h-3" />
            Preview
          </>
        )}
      </button>

      {/* Current Size Display */}
      {isPreviewActive && selectedDevice && (
        <div className="text-[10px] text-gray-500 uppercase tracking-wider ml-1">
          {DEVICES[selectedDevice][selectedOrientation].width}×{DEVICES[selectedDevice][selectedOrientation].height}
        </div>
      )}
    </div>
  );
};

interface DevicePreviewWrapperProps {
  children: React.ReactNode;
  device: DeviceType | null;
  orientation: Orientation;
  isActive: boolean;
}

export const DevicePreviewWrapper: React.FC<DevicePreviewWrapperProps> = ({
  children,
  device,
  orientation,
  isActive
}) => {
  if (!isActive || !device) {
    return <>{children}</>;
  }

  const config = DEVICES[device];
  const size = config[orientation];

  // Calculate scale to fit in viewport
  const viewportWidth = window.innerWidth - 40;
  const viewportHeight = window.innerHeight - 100;
  const scaleX = viewportWidth / size.width;
  const scaleY = viewportHeight / size.height;
  const scale = Math.min(scaleX, scaleY, 1);

  return (
    <div className="fixed inset-0 bg-battle-black/90 flex items-center justify-center pt-16 pb-4 px-4 z-50">
      {/* Device Frame */}
      <div
        className="relative bg-battle-grey rounded-2xl border-4 border-gray-700 shadow-2xl overflow-hidden"
        style={{
          width: size.width * scale,
          height: size.height * scale,
        }}
      >
        {/* Scaled Content */}
        <div
          className="origin-top-left overflow-auto bg-battle-black"
          style={{
            width: size.width,
            height: size.height,
            transform: `scale(${scale})`,
          }}
        >
          {children}
        </div>
      </div>

      {/* Device Info */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-3 text-sm text-gray-400">
        <span className="uppercase tracking-wider">{config.name}</span>
        <span className="text-gray-600">•</span>
        <span>{orientation === 'portrait' ? 'Portrait' : 'Landscape'}</span>
        <span className="text-gray-600">•</span>
        <span>{size.width} × {size.height}</span>
        {scale < 1 && (
          <>
            <span className="text-gray-600">•</span>
            <span className="text-yellow-500">{Math.round(scale * 100)}% zoom</span>
          </>
        )}
      </div>
    </div>
  );
};

export default DevicePreviewToolbar;
