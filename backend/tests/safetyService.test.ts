import { safetyService } from '../src/services/safetyService';

describe('safetyService', () => {
  it('blocks explicit abuse', () => {
    const result = safetyService.evaluateText('you should kill yourself');
    expect(result.action).toBe('block');
  });

  it('warns for mild negativity', () => {
    const result = safetyService.evaluateText('you are stupid');
    expect(result.action === 'warn' || result.action === 'block').toBe(true);
  });

  it('allows positive content', () => {
    const result = safetyService.evaluateText('I feel supported and empowered here');
    expect(result.action).toBe('allow');
  });
});
