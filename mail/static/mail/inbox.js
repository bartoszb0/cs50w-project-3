document.addEventListener('DOMContentLoaded', function() {

    // Use buttons to toggle between views
    document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
    document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
    document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
    document.querySelector('#compose').onclick = function() { compose_email(); }
  
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
  
  function compose_email(email=null) {
    // Hide error
    document.querySelector('#show-error').innerHTML = '';
  
    // Show compose view and hide other views
    document.querySelector('#show-email').style.display = 'none';
    document.querySelector('#emails-view').style.display = 'none';
    document.querySelector('#compose-view').style.display = 'block';

    // Clear out composition fields
    document.querySelector('#compose-recipients').value = '';
    document.querySelector('#compose-subject').value = '';
    document.querySelector('#compose-body').value = '';


    if (email) {
      document.querySelector('#compose-recipients').value = email.sender;
      document.querySelector('#compose-subject').value = email.subject;

      if (!document.querySelector('#compose-subject').value.startsWith('Re:')) {
        document.querySelector('#compose-subject').value = `Re: ${email.subject}`;
      }

      document.querySelector('#compose-body').value = `\n\nOn ${email.timestamp} ${email.sender} wrote: ${email.body}\n\n`;

    }


  }
  
  function load_mailbox(mailbox) {
    // Hide error
    document.querySelector('#show-error').innerHTML = '';
    
    // Show the mailbox and hide other views
    document.querySelector('#show-email').style.display = 'none';
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

        email_div.addEventListener('click', () => display_mail(emails[i].id));
      }
    });
  }

  function display_mail(mail_id) {
    // Hide error
    document.querySelector('#show-error').innerHTML = '';

    // Show the mailbox and hide other views
    document.querySelector('#show-email').style.display = 'block';
    document.querySelector('#emails-view').style.display = 'none';

    fetch(`/emails/${mail_id}`)
      .then(response => response.json())
      .then(email => {
          // Print email
          console.log(email);

      // Display email info
      document.querySelector('#email_sender').innerHTML = email.sender;
      document.querySelector('#email_receiver').innerHTML = email.recipients;
      if (email.subject) {
        document.querySelector('#email_subject').innerHTML = email.subject;
      } else {
        document.querySelector('#email_subject').innerHTML = 'No subject';
      }
      document.querySelector('#email_timestamp').innerHTML = email.timestamp;
      document.querySelector('#email_body').innerHTML = email.body.replace(/\n/g, '<br>');

      // Add button to archive / unarchive mail. Dont show the button on SENT mails.
      if (email.sender !== document.querySelector('#USER_EMAIL').innerHTML) {
        document.querySelector('#archive').style.display = 'block';
        if (email.archived === false) {
          document.querySelector('#archive').innerHTML = 'Archive';
        } else {
          document.querySelector('#archive').innerHTML = 'Unarchive';
        }
      } else {
        document.querySelector('#archive').style.display = 'none';
      }

      document.querySelector('#archive').onclick = function() { handle_archive(email); }
      document.querySelector('#reply').onclick = function() { compose_email(email); }

    });

    // Mark email as read
    fetch(`/emails/${mail_id}`, {
      method: 'PUT',
      body: JSON.stringify({
          read: true
      })
    })
  }

  function handle_archive(email) {
    if (email.archived === false) {
      fetch(`/emails/${email.id}`, {
        method: 'PUT',
        body: JSON.stringify({
            archived: true
        })
      })
      .then(() => load_mailbox('inbox'));
    } else {
      fetch(`/emails/${email.id}`, {
        method: 'PUT',
        body: JSON.stringify({
            archived: false
        })
      })
      .then(() => load_mailbox('inbox'));
    }
  }