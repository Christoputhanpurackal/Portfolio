export const trackVisitor = () => {
  // Only track once per session
  if (sessionStorage.getItem('visited')) {
    return;
  }
  
  sessionStorage.setItem('visited', 'true');

  const visitData = {
    id: Date.now().toString(),
    date: new Date().toISOString(),
    browser: getBrowserName(),
    device: getDeviceType(),
    ip: 'Simulated IP: ' + Math.floor(Math.random() * 255) + '.' + Math.floor(Math.random() * 255) + '.x.x', // Mock IP if backend not available
    pagesVisited: [window.location.pathname]
  };

  // Get existing visits from localStorage
  const existingVisits = JSON.parse(localStorage.getItem('visitorLogs') || '[]');
  existingVisits.push(visitData);
  
  // Keep last 1000 visits to avoid localStorage bloat
  if (existingVisits.length > 1000) {
    existingVisits.shift();
  }
  
  localStorage.setItem('visitorLogs', JSON.stringify(existingVisits));
};

function getBrowserName() {
  const userAgent = navigator.userAgent;
  if (userAgent.match(/chrome|chromium|crios/i)) return 'Chrome';
  if (userAgent.match(/firefox|fxios/i)) return 'Firefox';
  if (userAgent.match(/safari/i)) return 'Safari';
  if (userAgent.match(/opr\//i)) return 'Opera';
  if (userAgent.match(/edg/i)) return 'Edge';
  return 'Unknown';
}

function getDeviceType() {
  const ua = navigator.userAgent;
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
    return 'Tablet';
  }
  if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) {
    return 'Mobile';
  }
  return 'Desktop';
}

export const getVisitors = () => {
  return JSON.parse(localStorage.getItem('visitorLogs') || '[]');
};
