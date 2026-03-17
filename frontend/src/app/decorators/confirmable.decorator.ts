import Swal, { SweetAlertOptions } from 'sweetalert2';

export function Confirmable(options?: SweetAlertOptions) {
    return (target: Object, propertyKey: string, descriptor: PropertyDescriptor) => {
        const originalMethod = descriptor.value;

        const configOptions: SweetAlertOptions = {
            title: 'Suppression',
            html: 'Voulez-vous effectuer cette opération?',
            showCancelButton: true,
            confirmButtonText: 'OUI',
            cancelButtonText: 'NON',
            icon: 'question'
        };

        // Redefinir les options
        // if (options) {
        //     Object.keys(options).forEach(x => configOptions[x] = options[x])
        // }

        descriptor.value = async function(...args: any) {
            const res = await Swal.fire(configOptions);
            if (res.isConfirmed) {
                const result = originalMethod.apply(this, args);
                return result;
            }
        }

        return descriptor;
    };
}
