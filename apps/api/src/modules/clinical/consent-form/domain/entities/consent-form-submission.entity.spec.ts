import { ConsentFormSubmission } from './consent-form-submission.entity';
import { randomUUID } from 'crypto';

describe('ConsentFormSubmission entity', () => {
  const organizationId = randomUUID();
  const clinicId = randomUUID();
  const patientId = randomUUID();
  const templateId = randomUUID();
  const signedByUserId = randomUUID();

  const baseProps = () => ({
    organizationId,
    clinicId,
    patientId,
    templateId,
    templateVersion: 3,
    templateTitleSnapshot: 'Saç Ekimi Onam Formu v3',
    templateContentSnapshot: 'İmza anındaki tam metin buraya donar.',
    signatureImage: 'data:image/png;base64,iVBORw0KGgoAAAANSU...',
    signedByUserId,
  });

  it('sign → snapshot alanları imza anındaki template içeriğini birebir yansıtır', () => {
    const submission = ConsentFormSubmission.sign(baseProps());

    expect(submission.id.value).toBeDefined();
    expect(submission.templateVersion).toBe(3);
    expect(submission.templateTitleSnapshot).toBe('Saç Ekimi Onam Formu v3');
    expect(submission.templateContentSnapshot).toBe(
      'İmza anındaki tam metin buraya donar.'
    );
    expect(submission.signedAt).toBeInstanceOf(Date);
    expect(submission.signedByUserId).toBe(signedByUserId);
    expect(submission.appointmentId).toBeNull();
    expect(submission.treatmentId).toBeNull();
  });

  it('sign → opsiyonel appointmentId/treatmentId geçilirse saklanır', () => {
    const appointmentId = randomUUID();
    const treatmentId = randomUUID();

    const submission = ConsentFormSubmission.sign({
      ...baseProps(),
      appointmentId,
      treatmentId,
    });

    expect(submission.appointmentId?.value).toBe(appointmentId);
    expect(submission.treatmentId?.value).toBe(treatmentId);
  });

  it('toPersistence düz shape döner', () => {
    const submission = ConsentFormSubmission.sign(baseProps());
    const raw = submission.toPersistence();

    expect(raw.id).toBe(submission.id.value);
    expect(raw.patientId).toBe(patientId);
    expect(raw.templateId).toBe(templateId);
    expect(raw.templateVersion).toBe(3);
    expect(raw.signatureImage).toBe(baseProps().signatureImage);
  });
});
