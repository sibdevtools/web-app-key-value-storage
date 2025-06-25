import { Button, Form, Modal } from 'react-bootstrap';
import { Cancel01Icon, FloppyDiskIcon } from 'hugeicons-react';
import React, { useState } from 'react';

export interface SpaceModal {
  showModal: boolean;
  setShowModal: (showModal: boolean) => void;
  handleSave: (space: string) => void;
}

export const SpaceModal: React.FC<SpaceModal> = ({
                                                     showModal,
                                                     setShowModal,
                                                     handleSave
                                                   }) => {
  const [space, setSpace] = useState('');

  return (
    <Modal show={showModal} onHide={() => setShowModal(false)}>
      <Modal.Header closeButton>
        <Modal.Title>Create New Space</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={() => {
          handleSave(space);
          return false;
        }}>
          <Form.Group controlId="serviceCode">
            <Form.Label>Space</Form.Label>
            <Form.Control
              type="text"
              value={space}
              onChange={(e) => setSpace(e.target.value)}
            />
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button
          variant="secondary"
          onClick={() => setShowModal(false)}
          title={'Cancel'}
        >
          <Cancel01Icon />
        </Button>
        <Button
          variant="primary"
          onClick={() => handleSave(space)}
          title={'Save'}
        >
          <FloppyDiskIcon />
        </Button>
      </Modal.Footer>
    </Modal>
  );
};
