import { Button, Form, Modal } from 'react-bootstrap';
import { Cancel01Icon, FloppyDiskIcon } from 'hugeicons-react';
import React, { useState } from 'react';
import { getViewRepresentation, viewRepresentationToBase64, ViewType } from '../../../utils/view';

export interface RecordCreateModalProps {
  showModal: boolean;
  setShowModal: (showModal: boolean) => void;
  handleSave: (key: string, value: string, expiredAt: number | undefined) => void;
}

export const RecordCreateModal: React.FC<RecordCreateModalProps> = ({
                                                                          showModal,
                                                                          setShowModal,
                                                                          handleSave
                                                                        }) => {
  const [key, setKey] = useState('');
  const [value, setValue] = useState('');
  const [valueViewType, setValueViewType] = useState<ViewType>('base64');
  const [expiredAt, setExpiredAt] = useState<number | undefined>(undefined);

  return (
    <Modal show={showModal} onHide={() => setShowModal(false)}>
      <Modal.Header closeButton>
        <Modal.Title>Create New Record</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={() => {
          handleSave(key, value, expiredAt);
          return false;
        }}>
          <Form.Group controlId="keyCode">
            <Form.Label>Key</Form.Label>
            <Form.Control
              type="text"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              required={true}
            />
          </Form.Group>
          <Form.Group controlId="valueViewType">
            <Form.Label>Value View Type</Form.Label>
            <Form.Select
              value={valueViewType}
              onChange={(e) => setValueViewType(e.target.value as ViewType)}
              required={true}
            >
              <option value={'base64'}>Base64</option>
              <option value={'raw'}>Raw</option>
            </Form.Select>
          </Form.Group>
          <Form.Group controlId="value">
            <Form.Label>Value</Form.Label>
            <Form.Control
              type="text"
              value={getViewRepresentation(valueViewType, value)}
              onChange={(e) => setValue(viewRepresentationToBase64(valueViewType, e.target.value))}
            />
          </Form.Group>
          <Form.Group controlId="expiratedAt">
            <Form.Label>Expired At</Form.Label>
            <Form.Control
              type="number"
              value={expiredAt ?? ''}
              onChange={(e) => setExpiredAt(+e.target.value)}
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
          onClick={() => handleSave(key, value, expiredAt)}
          title={'Save'}
        >
          <FloppyDiskIcon />
        </Button>
      </Modal.Footer>
    </Modal>
  );
};
