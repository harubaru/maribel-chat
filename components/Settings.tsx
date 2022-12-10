import create from "zustand";

export function Settings() {
  const [open, settings, setSettings] = Settings.use((state) => [
    state.isOpen,
    state.settings,
    state.setSettings,
  ]);

  return (
    <div
      className={`absolute bottom-[3.75rem] duration-200 flex flex-col gap-4 p-3 w-80 bg-settingsPanel border border-chatbox rounded-lg drop-shadow-md ${
        open
          ? "block right-[0.75rem] lg:right-[0.5rem]"
          : "hidden opacity-0 right-[0.75rem]"
      }`}
    >
      <div className="flex flex-col gap-1">
        <div className="flex flex-row justify-between">
          <h1 className="text-white text-sm font-semibold">Model</h1>
        </div>
        <div className="flex flex-row gap-2">
          {["Convo 125M", "Convo 6B"].map((model) => (
            <button
              key={model}
              className={`rounded flex justify-center font-semibold px-2 items-center ${
                settings.model ===
                (model === "Convo 125M"
                  ? "convogpt-125m"
                  : "convogpt-6b")
                  ? "bg-white/10 text-white"
                  : "hover:text-white text-white/75"
              }`}
              onClick={() => {
                setSettings({
                  ...settings,
                  model:
                    model === "Convo 125M"
                      ? "convogpt-125m"
                      : "convogpt-6b",
                  length: Math.max(
                    100,
                    settings.length
                  )
                });
              }}
            >
              {model}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <div className="flex flex-row justify-between">
          <h1 className="text-white text-sm font-semibold">Length</h1>
          <p className="text-white/50 text-sm">
            {settings.length}
          </p>
        </div>
        <input
          type="range"
          className="w-full h-2 bg-white/10 rounded-full appearance-none"
          min={10}
          max={50}
          step={1}
          value={settings.length}
          onChange={(e) => {
            setSettings({
              ...settings,
              length: parseInt(e.target.value)
            });
          }}
        />
      </div>

      <div className="flex flex-col gap-1">
        <div className="flex flex-row justify-between">
          <h1 className="text-white text-sm font-semibold">Message Count</h1>
          <p className="text-white/50 text-sm">{settings.count}</p>
        </div>
        <input
          type="range"
          className="w-full h-2 bg-white/10 rounded-full appearance-none"
          min={1}
          max={4}
          step={1}
          value={settings.count}
          onChange={(e) => {
            setSettings({
              ...settings,
              count: parseInt(e.target.value),
            });
          }}
        />
      </div>
    </div>
  );
}

export type Settings = {
  model: string;
  length: number;
  count: number;
};

export type SettingsState = {
  settings: Settings;
  setSettings: (settings: Settings) => void;

  isOpen: boolean;
  setOpen: (isOpen: boolean) => void;
};

export namespace Settings {
  export const use = create<SettingsState>()((set) => ({
    settings: {
      model: "convo-6b",
      length: 40,
      count: 4
    } as Settings,
    setSettings: (settings: Settings) =>
      set((state: SettingsState) => ({
        settings: { ...state.settings, ...settings },
      })),

    isOpen: false,
    setOpen: (isOpen: boolean) => set((state: SettingsState) => ({ isOpen })),
  }));
}
