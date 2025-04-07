import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCallback, useMemo } from 'react';
import { useTaskStore } from '../../store/taskStore';
import { useTeamStore } from '../../store/teamStore';
import { useEquipmentStore } from '../../store/equipmentStore';
import { format } from 'date-fns';
import { Form } from '../ui/form';

const partSchema = z.object({
  name: z.string().min(1, "Le nom de la pièce est requis"),
  reference: z.string().optional(),
  quantity: z.number().min(1).optional()
});

const formSchema = z.object({
  taskId: z.string().min(1, "ID de tâche requis"),
  date: z.string().min(1, "Date requise"),
  client: z.object({
    name: z.string().min(1, "Le nom du client est requis"),
    address: z.string().optional(),
    contact: z.string().optional(),
    email: z.string().email("Email invalide").optional()
  }),
  technician: z.object({
    id: z.string().min(1, "Technicien requis"),
    name: z.string().min(1, "Nom du technicien requis")
  }),
  equipment: z.object({
    id: z.string().min(1, "Équipement requis"),
    name: z.string().min(1, "Le nom de l'équipement est requis"),
    brand: z.string().optional(),
    model: z.string().optional(),
    serialNumber: z.string().optional(),
    location: z.string().optional(),
    operatingHours: z.string().optional(),
    specifications: z.string().min(1, "Les spécifications sont requises")
  }),
  problem: z.string().optional(),
  description: z.string().min(10, {
    message: "La description doit contenir au moins 10 caractères"
  }),
  actions: z.string().min(1, "Au moins une action est requise"),
  partsUsed: z.array(partSchema).optional(),
  technicianNotes: z.string().optional(),
  technicianSignature: z.string().min(1, "Signature du technicien requise"),
  clientSignature: z.string().min(1, "Signature du client requise")
});

type FormInputValues = z.input<typeof formSchema>;
type FormOutputValues = z.output<typeof formSchema>;

interface InterventionReportFormProps {
  taskId?: string | null;
  onSubmit: (data: FormOutputValues) => Promise<void>;
  onCancel: () => void;
}

export default function InterventionReportForm({
  taskId,
  onSubmit
}: Omit<InterventionReportFormProps, 'onCancel'>) {
  const { tasks } = useTaskStore();
  const { members } = useTeamStore();
  const { equipment } = useEquipmentStore();

  const task = useMemo(() => 
    taskId ? tasks.find(t => t.id === taskId) : undefined,
    [taskId, tasks]
  );

  const technician = useMemo(() =>
    task?.technicianId ? members.find(m => m.id === Number(task.technicianId)) : undefined,
    [task?.technicianId, members]
  );

  const currentEquipment = useMemo(() =>
    task?.equipment ? equipment.find(e => e.id === task.equipment) : undefined,
    [task?.equipment, equipment]
  );

  const form = useForm<FormInputValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      taskId: task?.id || '',
      date: task?.date || format(new Date(), 'yyyy-MM-dd'),
      client: {
        name: task?.client.name || '',
        address: task?.client.address || undefined,
        contact: task?.client.contact || undefined,
        email: task?.client.email || undefined
      },
      technician: {
        id: task?.technicianId || '',
        name: technician?.name || ''
      },
      equipment: {
        id: task?.equipment?.id || '',
        name: task?.equipment?.name || '',
        brand: task?.equipment?.brand || undefined,
        model: task?.equipment?.model || undefined,
        serialNumber: task?.equipment?.serialNumber || undefined,
        location: currentEquipment?.location || undefined,
        operatingHours: currentEquipment?.operatingHours || undefined,
        specifications: JSON.stringify(currentEquipment?.specifications || {})
      },
      problem: task?.problem || undefined,
      description: task?.description || '',
      actions: task?.actions ? task.actions.join('\n') : '',
      partsUsed: undefined,
      technicianNotes: undefined,
      technicianSignature: '',
      clientSignature: ''
    }
  });

  const handleSubmit = useCallback(
    form.handleSubmit(async (data) => {
      try {
        await onSubmit(data as FormOutputValues);
      } catch (error) {
        console.error('Erreur lors de la soumission:', error);
      }
    }),
    [form, onSubmit]
  );

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Les champs du formulaire restent inchangés */}
      </form>
    </Form>
  );
}