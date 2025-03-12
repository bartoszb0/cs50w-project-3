document.addEventListener('DOMContentLoaded', function() {

    // Use buttons to toggle between views
    document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
    document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
    document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
    document.querySelector('#compose').addEventListener('click', compose_email);
  
    // By default, load the inbox
    load_mailbox('inbox');

    // Send email
    document.querySelector('#compose-form').onsubmit = function() {
        fetch('/emails', {
            method: 'POST',
            body: JSON.stringify({
                recipients: document.querySelector('#compose-recipients').value,
                subject: document.querySelector('#compose-subject').value,
                body: document.querySelector('#compose-body').value
            })
          })
          .then(response => response.json())
          .then(result => {
              // Print result
              console.log(result);
              if (result.message == 'Email sent successfully.') { // this shit works lmao
                load_mailbox('sent');
              }  else {
                document.querySelector('#show-error').innerHTML = `Error: ${result.error}`;
              }
              
          })

      .catch(error => { // catch any possible errors
          console.log('Error:', error);
      })

      return false;
      }

  });
  
  function compose_email() {
    // Delete error
    document.querySelector('#show-error').innerHTML = '';
  
    // Show compose view and hide other views
    document.querySelector('#emails-view').style.display = 'none';
    document.querySelector('#compose-view').style.display = 'block';
  
    // Clear out composition fields
    document.querySelector('#compose-recipients').value = '';
    document.querySelector('#compose-subject').value = '';
    document.querySelector('#compose-body').value = '';
  }
  
  function load_mailbox(mailbox) {
    // Delete error
    document.querySelector('#show-error').innerHTML = '';
    
    // Show the mailbox and hide other views
    document.querySelector('#emails-view').style.display = 'block';
    document.querySelector('#compose-view').style.display = 'none';
  
    // Show the mailbox name
    document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

    // Get all emails
    fetch(`/emails/${mailbox}`)
    .then(response => response.json())
    .then(emails => {

      // Print emails
      console.log(emails);
      
      // For each email - display it
        for (let i = 0; i < emails.length; i++) {
          email_div = document.querySelector('#emails-view').appendChild(document.createElement('div'));
          email_div.classList.add('email-item');

          sender = email_div.appendChild(document.createElement('span'));
          sender.classList.add('email-sender');
          sender.innerHTML = emails[i].sender;

          subject = email_div.appendChild(document.createElement('span'));
          subject.classList.add('email-subject');
          // Default subject if it wasn't provided
          if (emails[i].subject) {
            subject.innerHTML = emails[i].subject;
          } else {
            subject.innerHTML = 'No subject';
          }

          timestamp = email_div.appendChild(document.createElement('span'));
          timestamp.classList.add('email-timestamp');
          timestamp.innerHTML = emails[i].timestamp;

          // Change background of an email whether it was read
          if (emails[i].read === false) {
            email_div.style.backgroundColor = 'white';
          } else {
            email_div.style.backgroundColor = '#d1d1d1';
          }
        }
    });
  }