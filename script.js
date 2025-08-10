(function(){
  // Elements
  const btnMetric = document.getElementById('btn-metric');
  const btnImperial = document.getElementById('btn-imperial');
  const metricFields = document.getElementById('metric-fields');
  const imperialFields = document.getElementById('imperial-fields');

  const form = document.getElementById('bmi-form');
  const err = document.getElementById('form-error');

  const kg = document.getElementById('weight-kg');
  const cm = document.getElementById('height-cm');

  const lb = document.getElementById('weight-lb');
  const ft = document.getElementById('height-ft');
  const inch = document.getElementById('height-in');

  const bmiValue = document.getElementById('bmi-value');
  const bmiBadge = document.getElementById('bmi-badge');
  const marker = document.getElementById('scale-marker');

  const tileHeight = document.getElementById('tile-height');
  const tileWeight = document.getElementById('tile-weight');
  const rangeMetric = document.getElementById('range-metric');
  const rangeImperial = document.getElementById('range-imperial');

  const btnReset = document.getElementById('btn-reset');

  const SCALE_MIN = 12;
  const SCALE_MAX = 40;

  let unit = 'metric';

  // Defaults
  kg.value = '70';
  cm.value = '175';
  lb.value = '154';
  ft.value = '5';
  inch.value = '9';

  // Unit toggle
  function setUnit(next){
    unit = next;
    const isMetric = unit === 'metric';
    metricFields.hidden = !isMetric;
    imperialFields.hidden = isMetric;

    btnMetric.classList.toggle('is-active', isMetric);
    btnImperial.classList.toggle('is-active', !isMetric);
    btnMetric.setAttribute('aria-pressed', String(isMetric));
    btnImperial.setAttribute('aria-pressed', String(!isMetric));

    // Update displayed tiles and results when unit changes
    update();
  }

  btnMetric.addEventListener('click', () => setUnit('metric'));
  btnImperial.addEventListener('click', () => setUnit('imperial'));

  // Validation helper
  function validInputs(){
    if (unit === 'metric'){
      const w = parseFloat(kg.value);
      const h = parseFloat(cm.value);
      return isFinite(w) && w > 0 && isFinite(h) && h > 0;
    } else {
      const w = parseFloat(lb.value);
      const feet = parseFloat(ft.value);
      const inches = parseFloat(inch.value);
      const totalIn = (isFinite(feet) ? feet : 0) * 12 + (isFinite(inches) ? inches : 0);
      return isFinite(w) && w > 0 && totalIn > 0;
    }
  }

  function calculate(){
    if (unit === 'metric'){
      const weightKg = parseFloat(kg.value);
      const heightCm = parseFloat(cm.value);
      const heightM = heightCm / 100;
      const bmi = weightKg / (heightM * heightM);
      return { bmi, heightM, weightKg };
    } else {
      const weightLb = parseFloat(lb.value);
      const feet = parseFloat(ft.value);
      const inches = parseFloat(inch.value);
      const totalInches = (isFinite(feet) ? feet : 0) * 12 + (isFinite(inches) ? inches : 0);
      const bmi = (703 * weightLb) / (totalInches * totalInches);
      const heightM = totalInches * 0.0254;
      const weightKg = weightLb * 0.45359237;
      return { bmi, heightM, weightKg };
    }
  }

  function categorize(bmi){
    if (!isFinite(bmi)) return { label: '—', cls: '' };
    if (bmi < 18.5) return { label: 'Underweight', cls: 'teal' };
    if (bmi < 25)   return { label: 'Normal', cls: 'green' };
    if (bmi < 30)   return { label: 'Overweight', cls: 'amber' };
    return { label: 'Obese', cls: 'rose' };
  }

  function healthyRange(heightM){
    // 18.5 - 24.9
    const minKg = 18.5 * heightM * heightM;
    const maxKg = 24.9 * heightM * heightM;
    const minLb = minKg * 2.20462262;
    const maxLb = maxKg * 2.20462262;
    return {
      metric: `${minKg.toFixed(1)} – ${maxKg.toFixed(1)} kg`,
      imperial: `${minLb.toFixed(1)} – ${maxLb.toFixed(1)} lb`,
      minKg, maxKg
    };
  }

  function formatHeight(heightM){
    if (!isFinite(heightM) || heightM <= 0) return '--';
    if (unit === 'metric'){
      return `${(heightM * 100).toFixed(1)} cm`;
    } else {
      const totalIn = heightM / 0.0254;
      const feet = Math.floor(totalIn / 12);
      const inches = Math.round(totalIn - feet * 12);
      return `${feet} ft ${inches} in`;
    }
  }

  function formatWeight(weightKg){
    if (!isFinite(weightKg) || weightKg <= 0) return '--';
    if (unit === 'metric') return `${weightKg.toFixed(1)} kg`;
    return `${(weightKg * 2.20462262).toFixed(1)} lb`;
  }

  function update(){
    const ok = validInputs();
    err.hidden = ok;

    if (!ok){
      bmiValue.textContent = '--';
      bmiBadge.textContent = '—';
      bmiBadge.className = 'badge';
      marker.style.left = '-9999px';
      tileHeight.textContent = '--';
      tileWeight.textContent = '--';
      rangeMetric.textContent = '--';
      rangeImperial.textContent = '--';
      return;
    }

    const { bmi, heightM, weightKg } = calculate();

    // BMI and category
    bmiValue.textContent = isFinite(bmi) ? bmi.toFixed(1) : '--';
    const cat = categorize(bmi);
    bmiBadge.textContent = cat.label;
    bmiBadge.className = `badge ${cat.cls}`;

    // Marker position on scale (12-40)
    if (isFinite(bmi)){
      const p = Math.min(100, Math.max(0, ((bmi - SCALE_MIN) / (SCALE_MAX - SCALE_MIN)) * 100));
      marker.style.left = `${p}%`;
    } else {
      marker.style.left = '-9999px';
    }

    // Tiles
    tileHeight.textContent = formatHeight(heightM);
    tileWeight.textContent = formatWeight(weightKg);

    // Healthy weight range
    if (isFinite(heightM) && heightM > 0){
      const r = healthyRange(heightM);
      rangeMetric.textContent = r.metric;
      rangeImperial.textContent = r.imperial;
    } else {
      rangeMetric.textContent = '--';
      rangeImperial.textContent = '--';
    }
  }

  // Events
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    update();
  });

  // Live updates as user types
  [kg, cm, lb, ft, inch].forEach(el => {
    el && el.addEventListener('input', update);
  });

  btnReset.addEventListener('click', () => {
    // Reset defaults
    kg.value = '70';
    cm.value = '175';
    lb.value = '154';
    ft.value = '5';
    inch.value = '9';
    setUnit('metric');
    update();
  });

  // Initialize
  setUnit('metric');
  update();
})();
