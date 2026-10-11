# Album review app

Search MusicBrainz for albums and EPs, view their tracks, save personal ratings,
and browse the saved collection and tier list.

Run locally from the repository root:

```powershell
npm install
npm run install:all
npm run dev
```

Configure `backend/.env` using `backend/.env.example` and your existing PostgreSQL
connection. The frontend's `client/.env.development` points to the collection API
on port 5000 and the music API on port 3002. Open the URL printed by Vite
(normally http://localhost:5173).

If PowerShell blocks `npm.ps1`, use `npm.cmd` in place of `npm`, for example
`npm.cmd run dev`.

The collection API imports the database pool itself; no separate database
process is needed. The existing database ID columns support MusicBrainz UUIDs,
so this change requires no schema migration. Existing Tidal entries and ratings
remain available. They are not automatically matched to MusicBrainz entries;
adding the same album from MusicBrainz can create a separate entry.

Music data comes from the [MusicBrainz API](https://musicbrainz.org/doc/MusicBrainz_API).
No API key is needed for these reads. The server identifies itself with
`MUSICBRAINZ_USER_AGENT` (defaulting to this project's name/version and GitHub URL),
queues requests at least 1.1 seconds apart, retries temporary throttling, and
caches successful upstream responses for five minutes and complete tracklists
for thirty minutes. Run one music server instance per
outbound IP, or add a shared rate limiter before scaling across instances.

Search returns release groups, which combine editions of an album. Selecting an
album loads the earliest dated official release with track metadata, trying up
to three releases if tracklists are incomplete. If no official release exists,
other releases are considered. Multi-disc tracks are numbered consecutively;
unknown durations are stored as null. Edition browsing retrieves only metadata;
tracks are fetched for the selected edition. For albums with many editions,
MusicBrainz still requires pagination. Edition selection is automatic for now.

The drawer preloads the first result after a 600 ms pause, or an album you hover
for 200 ms or focus with the keyboard. Only one speculative album load runs at a
time. The dialog shares pending requests and reuses completed tracklists from a
bounded thirty-minute browser cache; closing it does not discard a useful load.

Artwork comes from the [Cover Art Archive](https://musicbrainz.org/doc/Cover_Art_Archive/API).
Albums without available artwork show a local placeholder.
The drawer and add-album dialog share 250-pixel thumbnails. Covers farther down
the drawer load as you scroll, and the page opens connections to the artwork
hosts early. Saved albums retain the 500-pixel cover URL.

Verify the change:

```powershell
npm test --prefix backend
npm run build --prefix client
```

For an optional live search and tracklist check against MusicBrainz (without
accessing the collection database), run `npm run check:music --prefix backend`.

The Vercel frontend project uses `client` as its Root Directory and `dist` as
its Output Directory. `client/vercel.json` includes the SPA rewrite recommended
in the [Vercel Vite documentation](https://vercel.com/docs/frameworks/frontend/vite#using-vite-to-make-spas).
It serves `index.html` for frontend routes such as `/tierlist`, allowing direct
links and page refreshes to reach React Router. Existing static files, including
the bundled JavaScript, CSS and artwork placeholder, are served normally.
Redeploy the frontend after changing this configuration, then verify `/tierlist`
by opening it directly and refreshing the page.

Collection pagination and search share `/api/albums?page=1&limit=20&sort=RANKING_DESC&search=Radiohead`.
The response includes `albums`, `page`, `totalPages`, `totalCount`, and the applied
`search` string. Counts apply to matching titles and artists, and every sort uses
an album ID tie-breaker so equally rated albums have consistent page boundaries.
Requests beyond the last page return the last available page. Omitting `limit`
still returns the full collection for the tier list. The original
`/api/lookup-albums?lookupString=...` array response remains available for older
clients; adding `limit` and `page` gives the paginated response.
Deploy the collection backend before the updated frontend to enable paginated
search. The frontend rejects search responses from an older backend that does
not confirm the applied filter, avoiding misleading unfiltered search results.

For deployment, configure each Render service under **Settings > Build & Deploy**:

| Setting | Music service (`tidalserver`) | Collection service (`albums`) |
| --- | --- | --- |
| Root Directory | `backend` | `backend` |
| Build Command | `npm ci` | `npm ci` |
| Start Command | `npm run start:musicserver` | `npm run start:server` |

Render runs build and start commands relative to the Root Directory
([Render monorepo documentation](https://render.com/docs/monorepo-support)).
`tidalserver` is the service name and hostname, not a repository directory.
The error `Root directory "tidalserver" does not exist` means that setting must
be changed to `backend`. Updating the start command alone cannot fix it.
The old `npm run start:tidalserver` command remains an alias for the MusicBrainz
server to support existing deployment settings.

Set `NODE_ENV=production` on both services, keep the collection service's existing
`DATABASE_URL`, and remove any explicit `MUSIC_SERVER_PORT` on the music service
so it listens on Render's assigned `PORT`. Production now gives `PORT` priority
over `MUSIC_SERVER_PORT`, even if an old override is still configured.
Tidal credentials are no longer used.
Redeploy both backend services with the current code before deploying the
frontend, because track loading and saving now use `duration_in_sec`.
A failed music deployment can leave the old Tidal server running, which returns
`duration_in_ISO8601`. Previously, this made track and album durations unavailable
even though search and track titles still worked. The frontend now
normalizes legacy `duration_in_ISO8601` responses to seconds before caching,
displaying and saving, so duration data remains usable during the transition.
Missing or invalid durations remain null; explicit null durations in the current
API are never replaced with zero or values from an older field. This compatibility
does not change a deployed Tidal service into MusicBrainz: the music service must
still be redeployed with the configuration above.

The music hostname can stay `https://tidalserver.onrender.com`, so the existing
frontend `VITE_API_MUSIC_BASE_URL` needs no change. If using a new hostname, update
that variable in the frontend deployment and rebuild it.

After redeployment, the music service's `/health` endpoint must return
`{"status":"ok","provider":"musicbrainz","apiVersion":1,"durationUnit":"seconds"}`.
Verify the deployed provider,
search, track durations and cache with this read-only check:

```powershell
npm run check:music --prefix backend -- https://tidalserver.onrender.com
```

Refresh the frontend after redeployment to discard cached tracklists from the
old server. MusicBrainz can still lack durations for individual tracks; these
remain marked unavailable rather than being counted as zero.
