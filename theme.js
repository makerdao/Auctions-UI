import makerTheme from '@makerdao/dai-ui-theme-maker';

const theme = {
  ...makerTheme,
  styles: {
    ...makerTheme.styles,
    statusBox: {
      ...makerTheme.styles.statusBox,
      layout: {
        ...makerTheme.styles.statusBox.layout,
        mt: 4
      }
    }
  }
};

export default theme;
