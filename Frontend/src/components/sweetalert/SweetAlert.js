import Swal from 'sweetalert2';

class SweetAlert {
  static confirmAction({ mode, message, confirm, message2,valid }) {
    Swal.fire({
      icon: mode,
      title: message,
      showConfirmButton: valid,
      showCancelButton: true,
      confirmButtonText: 'Confirmar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
    }).then((result) => {
      if (result.isConfirmed) {
        confirm();
        Swal.fire({
          icon: 'success', // Asegúrate de definir el icono aquí
          title: message2, // Mensaje del éxito
          showConfirmButton: false, // Opcional: Sin botón
          timer: 700, // Opcional: Tiempo en milisegundos
        });
      } else {
        // Si se cancela, puedes manejar el "close" si es necesario
        console.log('Operación cancelada');
      }
    });
  }
}

export default SweetAlert;
