# Compatibility
Compatibility tables for Chiri. Includes data for CalDAV clients, servers, and libraries.

[Clients](#clients) · [Libraries](#libraries) · [Servers](#servers)

## Clients
Other CalDAV clients tested alongside Chiri.

If a client is missing or you've found something incorrect, please [open an issue](https://github.com/chiriapp/chiri/issues).

### Legend
| Symbol | Meaning |
| ------ | ------- |
| ✅ Supported | Compatible with Chiri |
| 🟡 Limited | Supports a limited subset of iCalendar features, but should still work with Chiri |
| 🚫 Unsupported | Not compatible with Chiri |

---

### Status
| Client | Platform | Support | Notes |
| ------ | -------- | ------- | ----- |
| Apple Reminders | macOS, iOS | 🟡 | iCloud accounts are not supported, but third-party CalDAV server implementations with Apple Reminders work. Not all iCalendar features are supported. |
| DAVx⁵ | Android | ✅ | — |
| jtx Board | Android | ✅ | — |
| Tasks.org | Android | ✅ | — |

## Libraries
CalDAV libraries tested alongside Chiri.

If a library is missing or you've found something incorrect, please [open an issue](https://github.com/chiriapp/chiri/issues).

### Legend
| Symbol | Meaning |
| ------ | ------- |
| ✅ Supported | Compatible with Chiri |
| 🟡 Limited | Supports a limited subset of iCalendar features, but should still work with Chiri |
| 🚫 Unsupported | Not compatible with Chiri |

---

### Status
| Library | Language | Support | Notes |
| ------- | -------- | ------- | ----- |
| sabre/dav | PHP | ✅ | — |

## Servers
CalDAV server implementations tested with Chiri.

### Legend
| Symbol | Meaning |
| ------ | ------- |
| ✅ Supported | Supports a good chunk of iCalendar features and is compatible with Chiri |
| 🟡 Limited | Supports a limited subset of iCalendar features, but should still work with Chiri |
| 🤷 Best effort | Unable to test directly, but support is provided where possible |
| 🚫 Unsupported | Not compatible with Chiri |

---

### Status
#### Managed servers
| Server | Support | Notes |
| ------ | ------- | ----- |
| Fastmail | ✅ | Task support is not officially documented or surfaced in their UI, but their CalDAV server exposes VTODO. |
| Fruux | ✅ | The web UI for Fruux only supports Priority, Due Date, and Description. Setting a Due Date in the web UI also creates a reminder with the same value. |
| Google Calendar | 🚫 | Google does not support the VTODO component type in their CalDAV implementation. |
| iCloud | 🚫 | Apple switched to a proprietary format for Reminders after macOS 10.15 / iOS 13, which is incompatible with Chiri. |
| Infomaniak | 🤷 | Cannot test directly as the platform is available to EU residents only. |
| Mailbox.org | ✅ | — |
| Migadu | ✅ | Task support is not officially documented or surfaced in their UI, but their CalDAV server exposes VTODO. |
| Purelymail | ✅ | Task support is not officially documented or surfaced in their UI, but their CalDAV server exposes VTODO. |
| Runbox | ✅ | Task support is not officially documented or surfaced in their UI, but their CalDAV server exposes VTODO. |

---

#### Self-hosted servers
| Server | Support | Notes |
| ------ | ------- | ----- |
| Baikal | ✅ | Both Digest and Basic authentication are supported. |
| Mailcow | ✅ | — |
| Nextcloud | ✅ | Requires the [Tasks app](https://github.com/nextcloud/tasks/) to be installed. An optional OAuth Login Flow is available for quick setup. |
| OpenCloud | ✅ | Uses the Radicale CalDAV server internally. |
| Radicale | ✅ | — |
| RustiCal | ✅ | An optional OAuth Login Flow is available for quick setup. |
| Stalwart | ✅ | — |
| Vikunja | 🚫 | Proved unstable in testing. Chiri will show a warning when connecting to a Vikunja server. |
| Xandikos | ✅ | — |
