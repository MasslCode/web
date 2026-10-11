// Both album dialogs use the same bounds; their content scrolls above the actions.
export const albumDialogSx = {
  '& .MuiDialog-paper': {
    width: 'calc(100% - 32px)',
    maxWidth: 560,
    m: 2,
    maxHeight: 'calc(100dvh - 32px)',
    overflow: 'hidden',
  },
  '& .MuiDialogTitle-root': { overflowWrap: 'anywhere' },
  '& .MuiDialogContent-root': { minWidth: 0, px: { xs: 2, sm: 3 } },
  '& .MuiDialogActions-root': {
    px: 2,
    py: 1.5,
    gap: 1,
    '& .MuiButton-root': { minHeight: 44 },
  },
} as const;
