#import <AppKit/AppKit.h>

void chiri_macos_fix_help_menu(void) {
  if (![NSThread isMainThread]) {
    return;
  }

  NSMenu *mainMenu = [NSApplication sharedApplication].mainMenu;
  NSMenuItem *helpItem = [mainMenu itemWithTitle:@"Help"];
  NSMenu *helpSubmenu = helpItem.submenu;
  if (helpSubmenu == nil) {
    return;
  }

  [[NSApplication sharedApplication] setHelpMenu:helpSubmenu];
}

int chiri_macos_current_event_is_key_down(void) {
  NSEvent *event = [NSApplication sharedApplication].currentEvent;
  return event != nil && event.type == NSEventTypeKeyDown ? 1 : 0;
}
