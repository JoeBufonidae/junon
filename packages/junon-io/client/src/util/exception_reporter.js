const BetterDedupe = require("./better_dedupe")

const dedupeIntegration = new BetterDedupe()


const ExceptionReporter = {
  init: () => {
    // https://github.com/quasarframework/quasar/issues/2233
    
    Sentry.init({ 
      dsn: 'https://8679a5bdd4cec8869a4a12f25408bfee@o4512320633896960.ingest.us.sentry.io/4512320790069248', 
      release: ["junon-io@", window.revision].join(""),
      maxBreadcrumbs: 100,
      integrations: [dedupeIntegration],
      ignoreErrors: ['ResizeObserver loop limit exceeded', 'interrupted connection or unreachable host', 'Network Error', 'Extension context invalidated']
    })

    this.initialized = true
  },
  getDedupeInstance() {
    return dedupeIntegration
  },
  getSentryInstance() {
    return Sentry
  },
  captureException: (e) => {
    console.error(e)

    if (typeof debugMode !== "undefined" && debugMode) {
      return
    }

    if (!this.initialized) ExceptionReporter.init()
    Sentry.captureException(e)
  }
}

module.exports = ExceptionReporter
