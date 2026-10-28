// js/fees.js
(function () {
  const classId   = getQueryParam('classId');
  const studentId = getQueryParam('studentId');

  // Back button — force reload class page so fee icon updates immediately
  const backBtn = document.getElementById('backBtn');
  if (backBtn) {
    backBtn.onclick = () => {
      if (classId) {
        location.href = `class.html?classId=${classId}`;
      } else if (window.history.length > 1) {
        window.history.back();
      } else {
        location.href = 'index.html';
      }
    };
  }

  let _student = null;
  let _halaqah = null;
  let _unpaidPeriods = [];

  // ── Period helpers ────────────────────────────────────────────────────────

  function getPeriodLabel(periodKey, feePeriod, isAr) {
    // periodKey format: '2026-01' for monthly, '2026-W04' for weekly, '2026-T1' for term
    if (feePeriod === 'monthly') {
      const [y, m] = periodKey.split('-');
      const date = new Date(Number(y), Number(m) - 1, 1);
      return date.toLocaleDateString(isAr ? 'ar-SA' : 'en-US', { month: 'long', year: 'numeric' });
    }
    if (feePeriod === 'weekly') {
      return (isAr ? 'الأسبوع ' : 'Week ') + periodKey.split('-W')[1] + ' — ' + periodKey.split('-W')[0];
    }
    if (feePeriod === 'term') {
      const [y, t] = periodKey.split('-T');
      return (isAr ? 'الفصل ' : 'Term ') + t + ' — ' + y;
    }
    return periodKey;
  }

  function getAllPeriods(startMonth, feePeriod) {
    const periods = [];
    const now     = new Date();
    const start   = new Date(startMonth + '-01');

    if (feePeriod === 'monthly') {
      let cur = new Date(start.getFullYear(), start.getMonth(), 1);
      const end = new Date(now.getFullYear(), now.getMonth(), 1);
      while (cur <= end) {
        periods.push(cur.toISOString().slice(0, 7));
        cur.setMonth(cur.getMonth() + 1);
      }
    } else if (feePeriod === 'weekly') {
      // Get week number
      function getWeek(d) {
        const onejan = new Date(d.getFullYear(), 0, 1);
        return Math.ceil((((d - onejan) / 86400000) + onejan.getDay() + 1) / 7);
      }
      let cur = new Date(start);
      while (cur <= now) {
        const w = String(getWeek(cur)).padStart(2, '0');
        const key = `${cur.getFullYear()}-W${w}`;
        if (!periods.includes(key)) periods.push(key);
        cur.setDate(cur.getDate() + 7);
      }
    } else if (feePeriod === 'term') {
      // 3 terms per year
      function getTerm(d) {
        const m = d.getMonth() + 1;
        if (m >= 9 && m <= 12) return 1;
        if (m >= 1 && m <= 4)  return 2;
        return 3;
      }
      let curYear  = start.getFullYear();
      let curTerm  = getTerm(start);
      const nowTerm = getTerm(now);
      const nowYear = now.getFullYear();
      while (curYear < nowYear || (curYear === nowYear && curTerm <= nowTerm)) {
        periods.push(`${curYear}-T${curTerm}`);
        curTerm++;
        if (curTerm > 3) { curTerm = 1; curYear++; }
      }
    } else {
      // custom — treat as monthly
      let cur = new Date(start.getFullYear(), start.getMonth(), 1);
      const end = new Date(now.getFullYear(), now.getMonth(), 1);
      while (cur <= end) {
        periods.push(cur.toISOString().slice(0, 7));
        cur.setMonth(cur.getMonth() + 1);
      }
    }
    return periods;
  }

  function getPaidPeriods(student) {
    const paid = new Set();
    (student.feePayments || []).forEach(p => {
      (p.months || []).forEach(m => paid.add(m));
    });
    return paid;
  }

  function getTotalBalance(student, halaqah) {
    const periods   = getAllPeriods(student.feeStartMonth, halaqah.feePeriod);
    const paid      = getPaidPeriods(student);
    const unpaid    = periods.filter(p => !paid.has(p));
    const feeAmount = student.feeAmount || 0;
    return {
      total:   periods.length * feeAmount,
      paid:    paid.size * feeAmount,
      balance: unpaid.length * feeAmount,
      unpaidPeriods: unpaid,
      allPeriods: periods,
      paidSet: paid,
    };
  }

  // ── Payment modal ─────────────────────────────────────────────────────────

  window.selectPaymentMethod = function(method) {
    qs('paymentMethod').value = method;
    ['bank','wallet','stc','cash'].forEach(m => {
      const btn = document.getElementById('method' + m.charAt(0).toUpperCase() + m.slice(1));
      if (btn) {
        const isActive = (m === method) || (method === 'wallet' && (m === 'wallet' || m === 'stc')) || (method === 'stc' && (m === 'wallet' || m === 'stc'));
        btn.className = 'btn ' + (isActive ? 'btn-primary' : 'btn-secondary');
      }
    });
  };

  window.autoCalculatePeriods = function() {
    const amount    = parseFloat(qs('paymentAmount').value) || 0;
    const feeAmount = _student.feeAmount || 0;
    if (!feeAmount || !amount) {
      qs('autoCalcHint').style.display = 'none';
      return;
    }
    const count = Math.floor(amount / feeAmount);
    if (count > 0) {
      // Auto-check first N unpaid periods
      const checkboxes = document.querySelectorAll('#periodCheckboxes input[type=checkbox]');
      let checked = 0;
      checkboxes.forEach(cb => {
        if (checked < count && _unpaidPeriods.includes(cb.value)) {
          cb.checked = true;
          checked++;
        }
      });
      const isAr = getLang() === 'ar';
      qs('autoCalcHint').style.display = 'block';
      qs('autoCalcCount').textContent  = count + ' ' + (isAr ? 'فترة' : 'periods');
    } else {
      qs('autoCalcHint').style.display = 'none';
    }
  };

  window.openPaymentModal = function() {
    if (!_student || !_halaqah) return;
    const isAr = getLang() === 'ar';

    // Set currency
    qs('paymentCurrency').textContent = _halaqah.feeCurrency || '';

    // Build period checkboxes — show all unpaid periods
    const summary = getTotalBalance(_student, _halaqah);
    _unpaidPeriods = summary.unpaidPeriods;

    let html = '';
    if (_unpaidPeriods.length === 0) {
      html = `<div style="color:#16A34A; font-weight:700; text-align:center; padding:8px;">
        ✅ ${isAr ? 'جميع الفترات مدفوعة' : 'All periods paid'}
      </div>`;
    } else {
      _unpaidPeriods.forEach(p => {
        const label = getPeriodLabel(p, _halaqah.feePeriod, isAr);
        html += `
          <label style="display:flex; align-items:center; gap:10px; padding:8px; background:var(--bg); border-radius:8px; cursor:pointer;">
            <input type="checkbox" value="${p}" style="width:18px; height:18px; cursor:pointer;" />
            <span style="font-size:0.88rem;">${label}</span>
            <span style="margin-right:auto; font-size:0.82rem; color:var(--text-muted); font-weight:700;">${_student.feeAmount || 0} ${_halaqah.feeCurrency || ''}</span>
          </label>`;
      });
    }
    qs('periodCheckboxes').innerHTML = html;
    qs('paymentAmount').value = '';
    qs('autoCalcHint').style.display = 'none';
    selectPaymentMethod('bank');

    const modal = qs('paymentModal');
    modal.style.display = 'flex';
  };

  window.closePaymentModal = function() {
    qs('paymentModal').style.display = 'none';
  };

  window.savePayment = function() {
    const amount  = parseFloat(qs('paymentAmount').value) || 0;
    const method  = qs('paymentMethod').value;
    const checked = [...document.querySelectorAll('#periodCheckboxes input[type=checkbox]:checked')].map(cb => cb.value);

    if (!checked.length) {
      alert(getLang() === 'ar' ? 'يرجى اختيار فترة واحدة على الأقل' : 'Please select at least one period');
      return;
    }

    const data    = dbLoad();
    const student = data.students.find(s => s.id === studentId);
    if (!student) return;

    if (!student.feePayments) student.feePayments = [];
    student.feePayments.push({
      id:     uid(),
      months: checked,
      amount: amount,
      method: method,
      date:   new Date().toISOString().slice(0, 10),
    });

    saveStudent(student);
    closePaymentModal();

    // Send WhatsApp receipt
    sendPaymentReceipt(student, checked, amount, method);

    // Re-render fees page with updated data
    _student = dbLoad().students.find(s => s.id === studentId);
    renderFees();
  };

  // ── WhatsApp messages ─────────────────────────────────────────────────────

  
  function getMethodLabel(method, isAr) {
    const map = {
      bank: isAr ? 'تحويل بنكي' : 'Bank transfer',
      wallet: isAr ? 'محفظة إلكترونية' : 'Digital Wallet',
      stc: 'STC Pay',
      cash: isAr ? 'نقداً' : 'Cash'
    };
    return map[method] || method;
  }

  function sendPaymentReceipt(student, months, amount, method) {
    if (!student.phone) return;
    const isAr    = getLang() === 'ar';
    const halaqah = _halaqah;
    const currency = halaqah.feeCurrency || '';

    const periodLabels = months.map(m => getPeriodLabel(m, halaqah.feePeriod, isAr)).join('، ');

    const methodMap = { bank: isAr ? 'تحويل بنكي' : 'Bank transfer', wallet: isAr ? 'محفظة إلكترونية' : 'Digital Wallet', stc: 'STC Pay', cash: isAr ? 'نقداً' : 'Cash' };

    const msg = isAr
      ? `السلام عليكم ورحمة الله،\n\nتم استلام مبلغ *${amount} ${currency}* من رسوم الطالب *${student.name}*.\n\n📅 يغطي الفترة: ${periodLabels}\n💳 طريقة الدفع: ${methodMap[method] || method}\n\nشكراً لكم ✅\n— ${halaqah.name}`
      : `Assalamu Alaikum,\n\nPayment of *${amount} ${currency}* received for student *${student.name}*.\n\n📅 Covers: ${periodLabels}\n💳 Method: ${methodMap[method] || method}\n\nThank you ✅\n— ${halaqah.name}`;

    const phone = student.phone.replace(/[^0-9]/g, '');
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, '_blank');
  }

  window.sendFeeReminder = function() {
    if (!_student || !_halaqah) return;
    const isAr    = getLang() === 'ar';
    const summary = getTotalBalance(_student, _halaqah);
    if (!summary.unpaidPeriods.length) {
      alert(isAr ? 'لا توجد رسوم متأخرة لهذا الطالب' : 'No outstanding fees for this student');
      return;
    }

    const currency     = _halaqah.feeCurrency || '';
    const periodLabels = summary.unpaidPeriods.map(p => getPeriodLabel(p, _halaqah.feePeriod, isAr)).join('، ');
    const balance      = summary.balance;

    let paymentDetails = '';
    if (_halaqah.feeBankName || _halaqah.feeBankAccount) {
      paymentDetails += isAr
        ? `\n🏦 البنك: ${_halaqah.feeBankName || '—'}\n💳 رقم الحساب: ${_halaqah.feeBankAccount || '—'}`
        : `\n🏦 Bank: ${_halaqah.feeBankName || '—'}\n💳 Account: ${_halaqah.feeBankAccount || '—'}`;
    }
    if (_halaqah.feeStcNumber) {
      paymentDetails += isAr
        ? `\n📱 STC Pay: ${_halaqah.feeStcNumber}`
        : `\n📱 STC Pay: ${_halaqah.feeStcNumber}`;
    }

    const msg = isAr
      ? `السلام عليكم ورحمة الله،\n\nنود تذكيركم بأن رسوم الطالب *${_student.name}* غير مسددة للفترات التالية:\n📅 ${periodLabels}\n\n💰 المبلغ المستحق: *${balance} ${currency}*${paymentDetails}\n\nيرجى التكرم بالسداد في أقرب وقت ممكن.\nجزاكم الله خيراً 🙏\n— ${_halaqah.name}`
      : `Assalamu Alaikum,\n\nThis is a reminder that fees for student *${_student.name}* are outstanding for:\n📅 ${periodLabels}\n\n💰 Amount due: *${balance} ${currency}*${paymentDetails}\n\nPlease arrange payment at your earliest convenience.\nJazakum Allah Khayran 🙏\n— ${_halaqah.name}`;

    const phone = _student.phone.replace(/[^0-9]/g, '');
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  // ── Render ────────────────────────────────────────────────────────────────

  
  window.deletePayment = function(paymentId) {
    const isAr = getLang() === 'ar';
    const conf = confirm(isAr ? 'هل أنت متأكد من حذف هذه الدفعة؟' : 'Are you sure you want to delete this payment record?');
    if (!conf) return;

    const data = dbLoad();
    const student = data.students.find(s => s.id === studentId);
    if (!student || !student.feePayments) return;

    student.feePayments = student.feePayments.filter(p => p.id !== paymentId);
    saveStudent(student);

    _student = dbLoad().students.find(s => s.id === studentId);
    renderFees();
  };

  function renderFees() {
    const data    = dbLoad();
    _student      = data.students.find(s => s.id === studentId);
    _halaqah      = data.halaqah.find(h => h.id === classId);
    const container = qs('feesContainer');

    if (!_student || !_halaqah) {
      container.innerHTML = '<div class="card">طالب غير موجود</div>';
      return;
    }

    // Update page title
    qs('pageTitle').textContent = `💰 ${_student.name}`;

    const isAr    = getLang() === 'ar';
    const summary = getTotalBalance(_student, _halaqah);
    const currency = _halaqah.feeCurrency || '';
    const hasBalance = summary.balance > 0;

    let html = '';

    // ── Summary card ──
    html += `
      <section class="card" style="background:linear-gradient(135deg,${hasBalance ? '#7F1D1D,#DC2626' : '#14532D,#16A34A'}); color:#fff; border:none;">
        <div style="font-size:0.85rem; opacity:0.9; margin-bottom:4px;">${isAr ? 'سجل رسوم' : 'Fee Record'} — ${_student.name}</div>
        <div style="font-size:0.82rem; opacity:0.8; margin-bottom:14px;">${_halaqah.name}</div>
        <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:8px; text-align:center;">
          <div style="background:rgba(255,255,255,0.15); border-radius:10px; padding:10px;">
            <div style="font-size:1.3rem; font-weight:900;">${summary.total}</div>
            <div style="font-size:0.72rem; opacity:0.85;">${isAr ? 'الإجمالي' : 'Total'}<br>${currency}</div>
          </div>
          <div style="background:rgba(255,255,255,0.15); border-radius:10px; padding:10px;">
            <div style="font-size:1.3rem; font-weight:900;">${summary.paid}</div>
            <div style="font-size:0.72rem; opacity:0.85;">${isAr ? 'المدفوع' : 'Paid'}<br>${currency}</div>
          </div>
          <div style="background:rgba(255,255,255,0.25); border-radius:10px; padding:10px; border:2px solid rgba(255,255,255,0.4);">
            <div style="font-size:1.3rem; font-weight:900;">${summary.balance}</div>
            <div style="font-size:0.72rem; opacity:0.85;">${isAr ? 'المتبقي' : 'Balance'}<br>${currency}</div>
          </div>
        </div>
      </section>`;

    // ── Action buttons ──
    html += `
      <section class="card" style="display:flex; gap:8px;">
        <button class="btn btn-success" style="flex:1; padding:0.75rem; font-size:0.9rem;"
          onclick="openPaymentModal()">
          ✅ ${isAr ? 'تسجيل دفعة' : 'Record Payment'}
        </button>
        <button class="btn" style="flex:1; padding:0.75rem; font-size:0.9rem; background:#FEF3C7; color:#92400E;"
          onclick="sendFeeReminder()">
          📨 ${isAr ? 'إرسال تذكير' : 'Send Reminder'}
        </button>
      </section>`;

    // ── Periods list ──
    html += `<section class="card">
      <div style="font-size:0.95rem; font-weight:800; margin-bottom:12px;">
        ${isAr ? 'تفاصيل الفترات' : 'Period Details'}
      </div>`;

    if (!summary.allPeriods.length) {
      html += `<div style="text-align:center; color:var(--text-muted); padding:1rem;">${isAr ? 'لا توجد فترات بعد' : 'No periods yet'}</div>`;
    } else {
      [...summary.allPeriods].reverse().forEach(period => {
        const isPaid = summary.paidSet.has(period);
        const label  = getPeriodLabel(period, _halaqah.feePeriod, isAr);

        // Find payment details if paid
        let paymentInfo = '';
        if (isPaid) {
          const payment = (_student.feePayments || []).find(p => (p.months || []).includes(period));
          if (payment) {
            const methodMap = { bank: isAr ? 'تحويل بنكي' : 'Bank', wallet: isAr ? 'محفظة إلكترونية' : 'Wallet', stc: 'STC Pay', cash: isAr ? 'نقداً' : 'Cash' };
            paymentInfo = `<div style="font-size:0.72rem; color:#16A34A; margin-top:2px;">
              ${new Date(payment.date + 'T00:00:00').toLocaleDateString(isAr ? 'ar-SA' : 'en-US', { year:'numeric', month:'short', day:'numeric' })}
              · ${methodMap[payment.method] || payment.method}
              · ${payment.amount} ${currency}
            </div>`;
          }
        }

        html += `
          <div style="display:flex; align-items:center; gap:10px; padding:10px 0; border-bottom:1px solid var(--border);">
            <div style="font-size:1.3rem;">${isPaid ? '✅' : '❌'}</div>
            <div style="flex:1;">
              <div style="font-size:0.88rem; font-weight:700;">${label}</div>
              ${paymentInfo}
            </div>
            <div style="text-align:end;">
              <div style="font-size:0.85rem; font-weight:700; color:${isPaid ? '#16A34A' : '#DC2626'};">
                ${_student.feeAmount || 0} ${currency}
              </div>
              <div style="font-size:0.72rem; color:${isPaid ? '#16A34A' : '#DC2626'};">
                ${isPaid ? (isAr ? 'مدفوع' : 'Paid') : (isAr ? 'غير مدفوع' : 'Unpaid')}
              </div>
            </div>
          </div>`;
      });
    }

    html += `</section>`;

    // ── Payment history ──
    const payments = (_student.feePayments || []).slice().reverse();
    if (payments.length) {
      html += `<section class="card">
        <div style="font-size:0.95rem; font-weight:800; margin-bottom:12px;">
          ${isAr ? 'سجل المدفوعات' : 'Payment History'}
        </div>`;
      payments.forEach(p => {
        const methodMap = { bank: isAr ? 'تحويل بنكي' : 'Bank transfer', stc: 'STC Pay', cash: isAr ? 'نقداً' : 'Cash' };
        const dateStr   = new Date(p.date + 'T00:00:00').toLocaleDateString(isAr ? 'ar-SA' : 'en-US', { year:'numeric', month:'short', day:'numeric' });
        html += `
          <div style="display:flex; align-items:center; gap:10px; padding:10px 0; border-bottom:1px solid var(--border);">
            <div style="font-size:1.2rem;">💰</div>
            <div style="flex:1;">
              <div style="font-size:0.88rem; font-weight:700;">${p.amount} ${currency}</div>
              <div style="font-size:0.75rem; color:var(--text-muted);">${dateStr} · ${methodMap[p.method] || p.method}</div>
              <div style="font-size:0.75rem; color:var(--text-muted);">${(p.months || []).map(m => getPeriodLabel(m, _halaqah.feePeriod, isAr)).join('، ')}</div>
            </div>
          </div>`;
      });
      html += `</section>`;
    }

    container.innerHTML = html;
  }

  renderFees();
})();