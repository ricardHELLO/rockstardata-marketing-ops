import { describe, it, expect } from 'vitest';
import { normalizeLead } from '../../src/services/leads.service';
import { LeadContact } from '../../src/types';

describe('normalizeLead', () => {
  it('lowercases email and extracts domain', () => {
    const contact: LeadContact = {
      name: 'Juan García',
      email: '  JUAN@Restaurante.es  ',
      company: 'Restaurante García S.L.',
    };
    const result = normalizeLead(contact);
    expect(result.email).toBe('juan@restaurante.es');
    expect(result.domain).toBe('restaurante.es');
  });

  it('trims name and company', () => {
    const contact: LeadContact = {
      name: '  María López  ',
      email: 'maria@test.com',
      company: '  Grupo Tapas  ',
    };
    const result = normalizeLead(contact);
    expect(result.name).toBe('María López');
    expect(result.company).toBe('Grupo Tapas');
  });

  it('normalizes Spanish company suffixes', () => {
    const cases: [string, string][] = [
      ['Restaurante García S.L.', 'restaurante garcía'],
      ['Grupo Tapas S.A.', 'tapas'],
      ['HORECA Corp', 'horeca'],
      ['Foodie Group', 'foodie'],
      ['Bar El Sol SLU', 'bar el sol'],
    ];

    for (const [input, expected] of cases) {
      const contact: LeadContact = { name: 'Test', email: 'a@b.com', company: input };
      const result = normalizeLead(contact);
      expect(result.company_normalized).toBe(expected);
    }
  });

  it('preserves optional fields when provided', () => {
    const contact: LeadContact = {
      name: 'Test User',
      email: 'test@example.com',
      company: 'Acme',
      phone: ' +34 612 345 678 ',
      num_locations: 5,
      concept_type: ' Casual Dining ',
      pos: ' Revel ',
      cargo: ' CEO ',
      linkedin_url: 'https://linkedin.com/in/testuser',
    };
    const result = normalizeLead(contact);
    expect(result.phone).toBe('+34 612 345 678');
    expect(result.num_locations).toBe(5);
    expect(result.concept_type).toBe('Casual Dining');
    expect(result.pos).toBe('Revel');
    expect(result.cargo).toBe('CEO');
    expect(result.linkedin_url).toBe('https://linkedin.com/in/testuser');
  });

  it('handles missing optional fields gracefully', () => {
    const contact: LeadContact = {
      name: 'Minimal',
      email: 'min@test.com',
      company: 'Simple Corp',
    };
    const result = normalizeLead(contact);
    expect(result.phone).toBeUndefined();
    expect(result.num_locations).toBeUndefined();
    expect(result.concept_type).toBeUndefined();
  });

  it('handles email with no domain gracefully', () => {
    const contact: LeadContact = {
      name: 'Bad',
      email: 'nodomain',
      company: 'Test',
    };
    const result = normalizeLead(contact);
    expect(result.domain).toBe('');
  });
});
