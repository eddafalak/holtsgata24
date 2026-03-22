/**
 * Bil: fastar úr `p-[32px]`, `w-[280px]`, `gap-4` o.fl. sem koma fyrir í þínum skrám.
 */
export const spacing = {
  named: {
    sidebarWidth: '291px',
    sidebarWidthMax: '328px',
    sidebarPaddingX: '20px',
    sidebarPaddingRight: '36px',
    sidebarTop: '42px',
    headerHeight: '48px',
    controlHeight: '44px',
    controlHeightSm: '40px',
    fieldWidth: '280px',
    userMenuWidth: '240px',
    dialogButtonWidth: '200px',
    saveButtonWidth: '120px',
    loginMaxContent: '720px',
    loginMaxViewport: '1440px',
    textareaMinHeight: '104px',
    participantListMaxHeight: '180px',
  },

  /** `px-[2px]`, `gap-[6px]` o.fl. */
  arbitraryPx: [2, 4, 6, 8, 12, 16, 32] as const,

  patterns: {
    mainPadding: '32px',
    cardPadding: '24px',
    cardGap: '24px',
    sectionGap: '16px',
    stackTight: '8px',
    popoverOffset: '8px',
  },
} as const

export type Spacing = typeof spacing
