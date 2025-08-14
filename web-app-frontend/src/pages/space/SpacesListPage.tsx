import React, { useEffect, useState } from 'react';
import { Alert, Button, ButtonGroup, Col, Container, Row } from 'react-bootstrap';
import { Delete01Icon, PlusSignIcon, } from 'hugeicons-react';
import { SpaceModal } from './SpaceModal';
import { contextPath } from '../../const/common.const';
import { useNavigate } from 'react-router-dom';
import { deleteSpace, getSpaces, setValue } from '../../api/api';
import { CustomTable } from '@sibdevtools/frontend-common';

const SpacesListPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [spaces, setSpaces] = useState<string[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [minorError, setMinorError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchSpaces();
  }, []);

  const fetchSpaces = async () => {
    setLoading(true);
    try {
      const response = await getSpaces();
      if (response.data.success) {
        setSpaces(response.data.body);
      } else {
        setError('Failed to fetch spaces');
        return;
      }
    } catch (error) {
      console.error('Failed to fetch spaces:', error);
      setError('Failed to fetch spaces');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
    space: string
  ) => {
    if (!window.confirm('Are you sure?')) {
      return;
    }
    e.preventDefault();
    e.stopPropagation();
    try {
      const response = await deleteSpace(space);
      if (response.status !== 200 || !response.data.success) {
        setMinorError('Failed to delete space');
        return;
      }
      setSpaces(spaces.filter(it => it !== space));
    } catch (error) {
      console.error('Failed to delete space:', error);
      setMinorError('Failed to delete space');
    }
  };

  const handleAddClick = () => {
    setShowModal(true);
  };

  const handleSaveAdd = async (space: string) => {
    try {
      const response = await setValue({
        space: space,
        key: 'to-delete',
        value: null,
        expiredAt: 0
      });
      if (response.status !== 200 || !response.data.success) {
        setMinorError('Failed to add space');
        return;
      }
      setSpaces(Array.from(new Set([...spaces, space])));
    } catch (error) {
      console.error('Failed to add space:', error);
      setMinorError('Failed to add space');
    } finally {
      setShowModal(false);
    }
  };

  return (
    <Container className="mt-4 mb-4">
      <Row>
        <Col md={{ span: 6, offset: 3 }}>
          <span className={'h2'}>Spaces</span>
        </Col>
        <Col md={{ span: 1, offset: 1 }}>
          <ButtonGroup>
            <Button
              variant="outline-success"
              onClick={handleAddClick}
              title={'Add'}
            >
              <PlusSignIcon />
            </Button>
          </ButtonGroup>
        </Col>
      </Row>
      <Row className="mt-4">
        <Col md={{ span: 10, offset: 1 }}>
          {error && (
            <Alert variant="danger" onClose={() => setError(null)} dismissible>
              {error}
            </Alert>
          )}
          {minorError && (
            <Alert variant="danger" onClose={() => setMinorError(null)} dismissible>
              {minorError}
            </Alert>
          )}
          {!error && (
            <CustomTable
              table={{ responsive: true }}
              thead={{
                columns: {
                  space: {
                    label: 'Space',
                    sortable: true,
                    filterable: true,
                    className: 'text-center'
                  },
                  actions: {
                    label: 'Actions',
                    className: 'text-center'
                  }
                },
              }}
              tbody={{
                data: spaces.map(space => {
                  return {
                    spaceCode: space,
                    space: {
                      representation: <code>{space}</code>,
                      value: space,
                      className: 'text-center'
                    },
                    actions: {
                      representation:
                        <ButtonGroup>
                          <Button
                            variant={'danger'}
                            onClick={(e) => handleDelete(e, space)}
                            title={'Delete'}
                          >
                            <Delete01Icon />
                          </Button>
                        </ButtonGroup>
                    }
                  };
                }),
                rowBehavior: { handler: (row) => navigate(`${contextPath}space/${row['spaceCode']}/`) },
              }}
              loading={loading}
            />
          )}
        </Col>
      </Row>

      {/* Unified Modal for Add and Edit */}
      <SpaceModal
        showModal={showModal}
        setShowModal={setShowModal}
        handleSave={handleSaveAdd}
      />
    </Container>
  );
};

export default SpacesListPage;
