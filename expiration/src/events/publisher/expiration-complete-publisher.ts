import { Subjects, Publisher, ExpirationCompleteEvent } from '@ysticketing/common';



export class ExpirationCompletePublisher extends Publisher<ExpirationCompleteEvent> {
    subject: Subjects.ExpirationComplete = Subjects.ExpirationComplete;
    
}
