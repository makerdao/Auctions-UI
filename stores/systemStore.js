import create from 'zustand';

const [useAuctionsStore, sysAPI] = create((set, get) => ({
  blockHeight: 0,
  featureFlags: [],
  selectedIlk: 'ETH-A',

  setBlockHeight: val => {
    set({ blockHeight: val });
  },

  setSelectedIlk: selectedIlk => {
    set({ selectedIlk });
  },

  setFeatureFlag: val => {
    const { featureFlags } = get();

    set({ featureFlags: [val, ...featureFlags] });
  },

  unsetFeatureFlag: val => {
    const { featureFlags } = get();

    const filtered = featureFlags.filter(ff => ff !== val);

    set({ featureFlags: filtered });
  }
}));

export default useAuctionsStore;
export { sysAPI };
