    // Post indexes are data, never markup or arbitrary navigation destinations.
    function safePostHref(value) {
      if (typeof value !== 'string' || !/^\/?posts\/(?:games|music|food|stubby|beauty|lately)\/[a-zA-Z0-9_-]+\.html$/.test(value)) return null;
      return sitePath(`/${value.replace(/^\//, '')}`);
    }

    window.me0wberrySafePostHref = safePostHref;
