document.addEventListener('DOMContentLoaded', (event) => {
    const services = document.querySelectorAll('.service');
    services.forEach((service, index) => {
        setTimeout(() => {
            service.classList.add('fade-in');
        }, index * 200);
    });
});
