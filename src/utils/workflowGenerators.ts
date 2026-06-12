import type { OptimizationAction } from '../types';

export const generateOwnerEmail = (action: OptimizationAction, language: string): string => {
  const isEn = language !== 'es';
  const owner = action.owner || (isEn ? '[Owner Email]' : '[Correo del Responsable]');

  if (isEn) {
    return `Subject: Action Required: Optimization Opportunity for ${action.resourceName}

Hi ${owner},

Our Hybrid FinOps Command Center has identified an infrastructure optimization opportunity regarding a resource under your ownership.

Resource Details:
- Platform: ${action.platform}
- Resource Name: ${action.resourceName}
- Issue Detected: ${action.issue}

Optimization Plan:
${action.actionPlan}

Financial Impact:
- Estimated Monthly Savings: $${action.estimatedMonthlySavings.toLocaleString(undefined, { minimumFractionDigits: 2 })}
- Estimated Annual Savings: $${action.estimatedAnnualSavings.toLocaleString(undefined, { minimumFractionDigits: 2 })}

Risk & Impact Assessment:
- Risk Level: ${action.riskLevel}
- Production Impact: ${action.approvalRisk === 'High' ? 'High' : 'Minimal'}

Action Required:
Please review this recommendation. If valid, please reply to this email with your approval to proceed with the changes. If this resource is required in its current state, please provide a brief business justification for exception processing.

Thank you,
Cloud Operations & FinOps Team`;
  } else {
    return `Asunto: Acción Requerida: Oportunidad de Optimización para ${action.resourceName}

Hola ${owner},

Nuestro Hybrid FinOps Command Center ha identificado una oportunidad de optimización de infraestructura relacionada con un recurso bajo su responsabilidad.

Detalles del Recurso:
- Plataforma: ${action.platform}
- Nombre del Recurso: ${action.resourceName}
- Problema Detectado: ${action.issue}

Plan de Optimización:
${action.actionPlan}

Impacto Financiero:
- Ahorro Mensual Estimado: $${action.estimatedMonthlySavings.toLocaleString(undefined, { minimumFractionDigits: 2 })}
- Ahorro Anual Estimado: $${action.estimatedAnnualSavings.toLocaleString(undefined, { minimumFractionDigits: 2 })}

Evaluación de Riesgo e Impacto:
- Nivel de Riesgo: ${action.riskLevel === 'Low' ? 'Bajo' : action.riskLevel === 'Medium' ? 'Medio' : 'Alto'}
- Impacto en Producción: ${action.approvalRisk === 'High' ? 'Alto' : 'Mínimo'}

Acción Requerida:
Por favor revise esta recomendación. Si es válida, responda a este correo con su aprobación para proceder con los cambios. Si este recurso es requerido en su estado actual, por favor provea una breve justificación de negocio para procesar la excepción.

Gracias,
Equipo de Operaciones Cloud y FinOps`;
  }
};

export const generateTicketDraft = (action: OptimizationAction, language: string): string => {
  const isEn = language !== 'es';
  const owner = action.owner || 'Unknown';

  if (isEn) {
    return `SHORT DESCRIPTION:
FinOps Optimization: ${action.actionPlan} on ${action.resourceName}

BUSINESS JUSTIFICATION:
Proactive infrastructure waste reduction. This action is estimated to save $${action.estimatedAnnualSavings.toLocaleString(undefined, { minimumFractionDigits: 2 })} annually.

TECHNICAL EVIDENCE:
- Platform: ${action.platform}
- Resource: ${action.resourceName}
- Observation: ${action.issue}
- Owner: ${owner}
- Risk Level: ${action.riskLevel}

IMPLEMENTATION PLAN:
1. Verify resource state matches evidence.
2. Ensure owner (${owner}) has granted final approval.
3. Execute the following action: ${action.actionPlan}
4. Monitor telemetry for 24 hours post-change.

ROLLBACK PLAN:
If issues arise during the 24-hour monitoring period, revert the resource to its original configuration/sizing. Ensure recent snapshots or backups are available prior to execution.

ASSIGNMENT GROUP:
Cloud_Ops_L3`;
  } else {
    return `DESCRIPCIÓN CORTA:
Optimización FinOps: ${action.actionPlan} en ${action.resourceName}

JUSTIFICACIÓN DE NEGOCIO:
Reducción proactiva de desperdicio de infraestructura. Esta acción estima un ahorro de $${action.estimatedAnnualSavings.toLocaleString(undefined, { minimumFractionDigits: 2 })} anualmente.

EVIDENCIA TÉCNICA:
- Plataforma: ${action.platform}
- Recurso: ${action.resourceName}
- Observación: ${action.issue}
- Responsable: ${owner}
- Nivel de Riesgo: ${action.riskLevel === 'Low' ? 'Bajo' : action.riskLevel === 'Medium' ? 'Medio' : 'Alto'}

PLAN DE IMPLEMENTACIÓN:
1. Verificar que el estado del recurso coincida con la evidencia.
2. Asegurar que el responsable (${owner}) ha otorgado aprobación final.
3. Ejecutar la siguiente acción: ${action.actionPlan}
4. Monitorear telemetría por 24 horas posterior al cambio.

PLAN DE ROLLBACK:
Si surgen problemas durante el periodo de monitoreo de 24 horas, revertir el recurso a su configuración/tamaño original. Asegurar que haya snapshots o respaldos recientes disponibles antes de la ejecución.

GRUPO ASIGNADO:
Cloud_Ops_L3`;
  }
};
