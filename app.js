document.addEventListener('DOMContentLoaded', () => {
    // 1. Mobile Menu Toggle
    const mobileToggle = document.getElementById('mobile-toggle');
    const navMenu = document.getElementById('nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');

    if (mobileToggle && navMenu) {
        mobileToggle.addEventListener('click', () => {
            mobileToggle.classList.toggle('active');
            navMenu.classList.toggle('active');
        });

        // Close menu when any link is clicked inside the menu
        const menuLinks = navMenu.querySelectorAll('a');
        menuLinks.forEach(link => {
            link.addEventListener('click', () => {
                mobileToggle.classList.remove('active');
                navMenu.classList.remove('active');
            });
        });
    }

    // 2. Before/After Headlight Sliders (supporting multiple)
    const sliders = document.querySelectorAll('.slider-wrapper');
    
    sliders.forEach(sliderWrapper => {
        const sliderHandle = sliderWrapper.querySelector('.slider-handle');
        const afterImg = sliderWrapper.querySelector('.img-after');
        
        if (!sliderHandle || !afterImg) return;
        
        let isDragging = false;

        const setSliderPosition = (xPos) => {
            const rect = sliderWrapper.getBoundingClientRect();
            const wrapperWidth = rect.width;
            
            // Calculate relative X coordinate inside wrapper
            let relativeX = xPos - rect.left;
            
            // Constrain between 0 and wrapperWidth
            if (relativeX < 0) relativeX = 0;
            if (relativeX > wrapperWidth) relativeX = wrapperWidth;
            
            // Convert to percentage
            const percentage = (relativeX / wrapperWidth) * 100;
            
            // Update slider handle and image clip-path
            sliderHandle.style.left = `${percentage}%`;
            afterImg.style.clipPath = `polygon(0 0, ${percentage}% 0, ${percentage}% 100%, 0 100%)`;
        };

        // Mouse Events
        sliderWrapper.addEventListener('mousedown', (e) => {
            isDragging = true;
            setSliderPosition(e.clientX);
        });

        window.addEventListener('mouseup', () => {
            isDragging = false;
        });

        window.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            setSliderPosition(e.clientX);
        });

        // Touch Events (for mobile) - Prevent default scroll when interacting with the slider
        sliderWrapper.addEventListener('touchstart', (e) => {
            isDragging = true;
            setSliderPosition(e.touches[0].clientX);
            e.preventDefault();
        }, { passive: false });

        window.addEventListener('touchend', () => {
            isDragging = false;
        });

        window.addEventListener('touchmove', (e) => {
            if (!isDragging) return;
            setSliderPosition(e.touches[0].clientX);
            e.preventDefault();
        }, { passive: false });

        // Handle window resizing to recalculate clip-path properly
        window.addEventListener('resize', () => {
            const currentPercentage = parseFloat(sliderHandle.style.left) || 50;
            afterImg.style.clipPath = `polygon(0 0, ${currentPercentage}% 0, ${currentPercentage}% 100%, 0 100%)`;
        });
        
        // Initial state: Set to 50%
        sliderHandle.style.left = '50%';
        afterImg.style.clipPath = 'polygon(0 0, 50% 0, 50% 100%, 0 100%)';
    });

    // 3. Scroll Active State Links
    const sections = document.querySelectorAll('section');
    const headerNavLinks = document.querySelectorAll('.nav-link');

    window.addEventListener('scroll', () => {
        let currentSection = '';
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            // Highlight a bit before center
            if (pageYOffset >= (sectionTop - 150)) {
                currentSection = section.getAttribute('id');
            }
        });

        headerNavLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${currentSection}`) {
                link.classList.add('active');
            }
        });
    });

    // 4. Form Submission Handling (Web3Forms API Integration)
    const requestForm = document.getElementById('service-request-form');
    const successModal = document.getElementById('success-modal');
    const closeModalBtn = document.getElementById('close-modal-btn');
    const submitBtn = document.getElementById('submit-btn');

    if (requestForm && successModal) {
        requestForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            // Change button state to loading
            const originalBtnText = submitBtn.textContent;
            submitBtn.textContent = 'Submitting Request...';
            submitBtn.disabled = true;

            const formData = new FormData(requestForm);
            const accessKey = formData.get('access_key');

            // Fallback for demonstration / local testing when access key is default
            if (accessKey === 'YOUR_WEB3FORMS_ACCESS_KEY_HERE') {
                console.log('%cClearview Headlight Restoration Form Submission (Local Mock Mode)', 'color: #00E0FF; font-weight: bold;');
                console.log('Name:', formData.get('name'));
                console.log('Phone:', formData.get('phone'));
                console.log('Vehicle:', formData.get('vehicle'));
                console.log('Address:', formData.get('address'));
                console.log('Notes:', formData.get('notes'));

                // Mock network delay
                setTimeout(() => {
                    submitBtn.textContent = originalBtnText;
                    submitBtn.disabled = false;
                    
                    // Show success modal
                    successModal.classList.add('active');
                    requestForm.reset();
                }, 800);
                
                return;
            }

            // Real submission via Web3Forms API
            fetch('https://api.web3forms.com/submit', {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                submitBtn.textContent = originalBtnText;
                submitBtn.disabled = false;

                if (data.success) {
                    // Show success modal
                    successModal.classList.add('active');
                    requestForm.reset();
                } else {
                    alert('Submission failed: ' + (data.message || 'Please check your connection and try again.'));
                }
            })
            .catch(error => {
                console.error('Submission Error:', error);
                submitBtn.textContent = originalBtnText;
                submitBtn.disabled = false;
                alert('An error occurred. Please contact Drew at 986-208-2372 directly.');
            });
        });

        // Close Modal Controls
        const closeModal = () => {
            successModal.classList.remove('active');
        };

        if (closeModalBtn) {
            closeModalBtn.addEventListener('click', closeModal);
        }

        successModal.addEventListener('click', (e) => {
            if (e.target === successModal) {
                closeModal();
            }
        });
    }
});
