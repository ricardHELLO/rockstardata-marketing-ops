/* RockstarData Marketing Ops — Admin Panel */

const API_BASE = '/api';
const API_KEY = 'dev-test-key-change-in-prod';

// --- Helpers ---

async function api(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': API_KEY,
      ...options.headers,
    },
    ...options,
  });
  const data = await res.json();
  if (!data.ok) throw new Error(data.error?.message || 'API error');
  return data.data;
}

function esc(str) {
  if (str == null) return '';
  const div = document.createElement('div');
  div.textContent = String(str);
  return div.innerHTML;
}

function formatDate(iso) {
  if (!iso) return '-';
  const d = new Date(iso);
  return d.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' }) +
    ' ' + d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
}

function shortId(id) {
  return id ? id.substring(0, 8) : '-';
}

function createBadge(text) {
  const span = document.createElement('span');
  span.className = 'badge badge-' + esc(text);
  span.textContent = text;
  return span;
}

function clearChildren(el) {
  while (el.firstChild) el.removeChild(el.firstChild);
}

function emptyRow(cols, message) {
  const tr = document.createElement('tr');
  const td = document.createElement('td');
  td.colSpan = cols;
  td.style.textAlign = 'center';
  td.style.color = '#999';
  td.textContent = message;
  tr.appendChild(td);
  return tr;
}

// --- Tabs ---

document.querySelectorAll('.tab').forEach((btn) => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach((b) => b.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach((s) => s.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById('tab-' + btn.dataset.tab).classList.add('active');
    if (btn.dataset.tab === 'approvals') loadApprovals();
    if (btn.dataset.tab === 'leads') loadLeads();
    if (btn.dataset.tab === 'logs') loadLogs();
  });
});

// --- Approvals ---

async function loadApprovals() {
  const status = document.getElementById('approval-status-filter').value;
  const qs = status ? '?status=' + encodeURIComponent(status) : '';
  try {
    const approvals = await api('/approvals' + qs);
    const tbody = document.querySelector('#approvals-table tbody');
    clearChildren(tbody);

    if (approvals.length === 0) {
      tbody.appendChild(emptyRow(8, 'No approvals found'));
      return;
    }

    approvals.forEach((a) => {
      const tr = document.createElement('tr');

      const tdId = document.createElement('td');
      tdId.title = a.id;
      tdId.textContent = shortId(a.id);
      tr.appendChild(tdId);

      const tdType = document.createElement('td');
      tdType.textContent = a.type;
      tr.appendChild(tdType);

      const tdAgent = document.createElement('td');
      tdAgent.textContent = a.agent_name;
      tr.appendChild(tdAgent);

      const tdSummary = document.createElement('td');
      tdSummary.title = a.summary;
      tdSummary.textContent = a.summary;
      tr.appendChild(tdSummary);

      const tdPriority = document.createElement('td');
      tdPriority.appendChild(createBadge(a.priority));
      tr.appendChild(tdPriority);

      const tdStatus = document.createElement('td');
      tdStatus.appendChild(createBadge(a.status));
      tr.appendChild(tdStatus);

      const tdDate = document.createElement('td');
      tdDate.textContent = formatDate(a.requested_at);
      tr.appendChild(tdDate);

      const tdActions = document.createElement('td');
      const viewBtn = document.createElement('button');
      viewBtn.className = 'btn-view';
      viewBtn.textContent = 'View';
      viewBtn.addEventListener('click', () => viewApproval(a.id));
      tdActions.appendChild(viewBtn);

      if (a.status === 'pending') {
        const approveBtn = document.createElement('button');
        approveBtn.className = 'btn-primary';
        approveBtn.textContent = 'Approve';
        approveBtn.style.marginLeft = '4px';
        approveBtn.addEventListener('click', () => decideApproval(a.id, 'approved'));
        tdActions.appendChild(approveBtn);

        const rejectBtn = document.createElement('button');
        rejectBtn.className = 'btn-danger';
        rejectBtn.textContent = 'Reject';
        rejectBtn.style.marginLeft = '4px';
        rejectBtn.addEventListener('click', () => decideApproval(a.id, 'rejected'));
        tdActions.appendChild(rejectBtn);
      }

      tr.appendChild(tdActions);
      tbody.appendChild(tr);
    });
  } catch (err) {
    console.error('Failed to load approvals:', err);
  }
}

async function viewApproval(id) {
  try {
    const a = await api('/approvals/' + encodeURIComponent(id));
    document.getElementById('modal-title').textContent = 'Approval: ' + a.type;

    const body = document.getElementById('modal-body');
    clearChildren(body);

    const dl = document.createElement('dl');
    const fields = [
      ['ID', a.id],
      ['Type', a.type],
      ['Agent', a.agent_name],
      ['Summary', a.summary],
      ['Requested', formatDate(a.requested_at)],
      ['Decided by', a.decided_by || '-'],
      ['Decided at', formatDate(a.decided_at)],
      ['Notes', a.notes || '-'],
      ['Lead ID', a.linked_lead_id || '-'],
      ['Action type', a.action_type || '-'],
    ];
    fields.forEach(([label, value]) => {
      const dt = document.createElement('dt');
      dt.textContent = label;
      dl.appendChild(dt);
      const dd = document.createElement('dd');
      if (label === 'Priority' || label === 'Status') {
        dd.appendChild(createBadge(value));
      } else {
        dd.textContent = value;
      }
      dl.appendChild(dd);
    });

    // Priority and status badges
    const dtPriority = document.createElement('dt');
    dtPriority.textContent = 'Priority';
    dl.appendChild(dtPriority);
    const ddPriority = document.createElement('dd');
    ddPriority.appendChild(createBadge(a.priority));
    dl.appendChild(ddPriority);

    const dtStatus = document.createElement('dt');
    dtStatus.textContent = 'Status';
    dl.appendChild(dtStatus);
    const ddStatus = document.createElement('dd');
    ddStatus.appendChild(createBadge(a.status));
    dl.appendChild(ddStatus);

    body.appendChild(dl);

    // Payload
    const h3 = document.createElement('h3');
    h3.style.marginTop = '1rem';
    h3.style.fontSize = '0.9rem';
    h3.textContent = 'Payload';
    body.appendChild(h3);

    const pre = document.createElement('pre');
    pre.textContent = JSON.stringify(a.payload_after, null, 2);
    body.appendChild(pre);

    if (a.execution_result) {
      const h3r = document.createElement('h3');
      h3r.style.marginTop = '1rem';
      h3r.style.fontSize = '0.9rem';
      h3r.textContent = 'Execution Result';
      body.appendChild(h3r);
      const preR = document.createElement('pre');
      preR.textContent = JSON.stringify(a.execution_result, null, 2);
      body.appendChild(preR);
    }

    // Modal actions
    const actions = document.getElementById('modal-actions');
    clearChildren(actions);
    if (a.status === 'pending') {
      const approveBtn = document.createElement('button');
      approveBtn.className = 'btn-primary';
      approveBtn.textContent = 'Approve';
      approveBtn.addEventListener('click', () => decideApproval(a.id, 'approved'));
      actions.appendChild(approveBtn);

      const rejectBtn = document.createElement('button');
      rejectBtn.className = 'btn-danger';
      rejectBtn.textContent = 'Reject';
      rejectBtn.addEventListener('click', () => decideApproval(a.id, 'rejected'));
      actions.appendChild(rejectBtn);
    }

    document.getElementById('modal-overlay').classList.remove('hidden');
  } catch (err) {
    console.error('Failed to load approval:', err);
  }
}

async function decideApproval(id, status) {
  const notes = status === 'rejected' ? prompt('Rejection reason (optional):') : null;
  try {
    await api('/approvals/' + encodeURIComponent(id), {
      method: 'PATCH',
      body: JSON.stringify({
        status,
        decided_by: 'ricard',
        notes: notes || undefined,
      }),
    });
    document.getElementById('modal-overlay').classList.add('hidden');
    loadApprovals();
  } catch (err) {
    alert('Failed: ' + err.message);
  }
}

// --- Leads ---

async function loadLeads() {
  const status = document.getElementById('lead-status-filter').value;
  const qs = status ? '?status=' + encodeURIComponent(status) : '';
  try {
    const leads = await api('/leads' + qs);
    const tbody = document.querySelector('#leads-table tbody');
    clearChildren(tbody);

    if (leads.length === 0) {
      tbody.appendChild(emptyRow(7, 'No leads found'));
      return;
    }

    leads.forEach((l) => {
      const norm = l.normalized || {};
      const raw = l.raw_payload || {};
      const tr = document.createElement('tr');

      const tdId = document.createElement('td');
      tdId.title = l.id;
      tdId.textContent = shortId(l.id);
      tr.appendChild(tdId);

      const tdName = document.createElement('td');
      tdName.textContent = norm.name || raw.name || '-';
      tr.appendChild(tdName);

      const tdEmail = document.createElement('td');
      tdEmail.textContent = norm.email || raw.email || '-';
      tr.appendChild(tdEmail);

      const tdCompany = document.createElement('td');
      tdCompany.textContent = norm.company || raw.company || '-';
      tr.appendChild(tdCompany);

      const tdSource = document.createElement('td');
      tdSource.textContent = l.source;
      tr.appendChild(tdSource);

      const tdStatus = document.createElement('td');
      tdStatus.appendChild(createBadge(l.status));
      tr.appendChild(tdStatus);

      const tdDate = document.createElement('td');
      tdDate.textContent = formatDate(l.created_at);
      tr.appendChild(tdDate);

      tbody.appendChild(tr);
    });
  } catch (err) {
    console.error('Failed to load leads:', err);
  }
}

// --- Logs ---

async function loadLogs() {
  const agent = document.getElementById('log-agent-filter').value;
  const qs = agent ? '?agent_name=' + encodeURIComponent(agent) : '';
  try {
    const logs = await api('/logs' + qs);
    const tbody = document.querySelector('#logs-table tbody');
    clearChildren(tbody);

    if (logs.length === 0) {
      tbody.appendChild(emptyRow(5, 'No logs found'));
      return;
    }

    logs.forEach((l) => {
      const tr = document.createElement('tr');

      const tdTime = document.createElement('td');
      tdTime.textContent = formatDate(l.timestamp);
      tr.appendChild(tdTime);

      const tdLevel = document.createElement('td');
      tdLevel.appendChild(createBadge(l.level));
      tr.appendChild(tdLevel);

      const tdAgent = document.createElement('td');
      tdAgent.textContent = l.agent_name;
      tr.appendChild(tdAgent);

      const tdAction = document.createElement('td');
      tdAction.textContent = l.action;
      tr.appendChild(tdAction);

      const tdDetails = document.createElement('td');
      const detailStr = l.details ? JSON.stringify(l.details) : '-';
      tdDetails.title = detailStr;
      tdDetails.textContent = detailStr.length > 80 ? detailStr.substring(0, 80) + '...' : detailStr;
      tr.appendChild(tdDetails);

      tbody.appendChild(tr);
    });
  } catch (err) {
    console.error('Failed to load logs:', err);
  }
}

// --- Modal close ---

document.getElementById('modal-close').addEventListener('click', () => {
  document.getElementById('modal-overlay').classList.add('hidden');
});

document.getElementById('modal-overlay').addEventListener('click', (e) => {
  if (e.target === e.currentTarget) {
    e.currentTarget.classList.add('hidden');
  }
});

// --- Refresh buttons ---

document.getElementById('refresh-approvals').addEventListener('click', loadApprovals);
document.getElementById('refresh-leads').addEventListener('click', loadLeads);
document.getElementById('refresh-logs').addEventListener('click', loadLogs);
document.getElementById('approval-status-filter').addEventListener('change', loadApprovals);
document.getElementById('lead-status-filter').addEventListener('change', loadLeads);

// --- Init ---
loadApprovals();
