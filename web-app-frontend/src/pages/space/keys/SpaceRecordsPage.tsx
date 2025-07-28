import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, Button, ButtonGroup, Col, Container, Form, Row } from 'react-bootstrap';
import { ArrowLeft01Icon, Delete01Icon, FloppyDiskIcon, PlusSignIcon } from 'hugeicons-react';
import { contextPath } from '../../../const/common.const';
import { useNavigate, useParams } from 'react-router-dom';
import { deleteKey, getKeys, getValue, setValue, ValueHolder } from '../../../api/api';
import { CustomTable, Loader } from '@sibdevtools/frontend-common';
import { CustomTableParts } from '@sibdevtools/frontend-common/dist/components/custom-table/types';
import { getViewRepresentation, viewRepresentationToBase64, ViewType } from '../../../utils/view';
import { RecordCreateModal } from './RecordCreateModal';

interface CachedValue {
  data?: ValueHolder;
  viewType: ViewType;
  loading: boolean;
  changed: boolean;
  error?: string;
}

const SpaceRecordsPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [keys, setKeys] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [minorError, setMinorError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const navigate = useNavigate();
  const { space } = useParams();

  const [valuesCache, setValuesCache] = useState<Record<string, CachedValue>>({});

  if (!space) {
    navigate(contextPath);
    return;
  }

  const ExpandableRowContent: React.FC<{ keyName: string }> = ({ keyName }) => {
    const cacheItem = valuesCache[keyName] || { loading: false };
    const { data, loading, error } = cacheItem;
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
      if (!data && !loading && !error) {
        loadKeyValue(keyName);
      }
    }, [keyName, data, loading, error]);

    if (loading) {
      return <Loader loading={true} />;
    }

    if (error) {
      return <Alert variant="danger">{error}</Alert>;
    }

    const toLocalDate = (amount: number | undefined | null): string => {
      if (!amount) {
        return '-';
      }
      const d = new Date(amount);
      return d.toISOString();
    };

    const handleBlur = () => {
      if (!textareaRef.current) {
        return;
      }
      const newValue = textareaRef.current.value;
      if (newValue === data?.value) {
        return;
      }
      setValuesCache(prev => ({
        ...prev,
        [keyName]: {
          ...prev[keyName],
          changed: true,
          data: {
            ...prev[keyName].data,
            value: viewRepresentationToBase64(cacheItem.viewType, newValue),
          } as ValueHolder,
        },
      }));
    };

    return (
      <Container>
        <Row>
          <Col xs={4}>
            <Row>
              <Col xs={4}>Created At</Col>
              <Col xs={8}>{toLocalDate(data?.meta.createdAt)}</Col>
            </Row>
            <Row>
              <Col xs={4}>Modified At</Col>
              <Col xs={8}>{toLocalDate(data?.meta.modifiedAt)}</Col>
            </Row>
            <Row>
              <Col xs={4}>Expired At</Col>
              <Col xs={8}>{toLocalDate(data?.meta.expiredAt)}</Col>
            </Row>
          </Col>
          <Col xs={8}>
            <Row>
              <Form.Select
                value={cacheItem.viewType}
                onChange={(e) => setValuesCache(prev => ({
                  ...prev,
                  [keyName]: {
                    ...prev[keyName],
                    viewType: e.target.value as ViewType,
                  } as CachedValue,
                }))}
                required={true}
              >
                <option value={'base64'}>Base64</option>
                <option value={'raw'}>Raw</option>
              </Form.Select>
            </Row>
            <Row>
            <textarea
              ref={textareaRef}
              id={`value-${keyName}`}
              className={'form-control'}
              defaultValue={getViewRepresentation(cacheItem.viewType, data?.value || '')}
              onBlur={handleBlur}
            />
            </Row>
          </Col>
        </Row>
      </Container>
    );
  };

  const fetchKeys = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getKeys(space);
      if (response.data.success) {
        setKeys(response.data.body);
      } else {
        setError('Failed to fetch keys');
      }
    } catch (error) {
      console.error('Failed to fetch keys:', error);
      setError('Failed to fetch keys');
    } finally {
      setLoading(false);
    }
  }, [space]);

  const loadKeyValue = useCallback(async (key: string) => {
    setValuesCache(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        loading: true,
        error: undefined
      }
    }));

    try {
      const response = await getValue(space, key);
      if (response.data.success) {
        setValuesCache(prev => ({
          ...prev,
          [key]: {
            data: response.data.body,
            viewType: 'base64',
            changed: false,
            loading: false
          }
        }));
      } else {
        setValuesCache(prev => ({
          ...prev,
          [key]: {
            viewType: 'base64',
            loading: false,
            changed: false,
            error: 'Failed to fetch value'
          }
        }));
      }
    } catch (err) {
      console.error(`Failed to fetch value for key ${key}:`, err);
      setValuesCache(prev => ({
        ...prev,
        [key]: {
          viewType: 'base64',
          loading: false,
          changed: false,
          error: 'Failed to fetch value'
        }
      }));
    }
  }, [space]);

  const handleUpdate = async (key: string) => {
    const cachedValue = valuesCache[key];
    const value = cachedValue.data?.value;
    if (value === undefined) {
      return;
    }

    try {
      const response = await setValue({
        space,
        key,
        value: value,
        expiredAt: cachedValue.data?.meta.expiredAt,
      });
      if (response.status !== 200 || !response.data.success) {
        setMinorError(`Failed to update key: ${key}`);
        return;
      }

      setValuesCache(prev => {
        const { [key]: _, ...rest } = prev;
        return rest;
      });
    } catch (error) {
      console.error(`Failed to update key: ${key}`, error);
      setMinorError(`Failed to update key: ${key}`);
    }
  };

  const handleDelete = async (key: string) => {
    if (!window.confirm('Are you sure?')) return;

    try {
      const response = await deleteKey(space, key);
      if (response.status !== 200 || !response.data.success) {
        setMinorError('Failed to delete key');
        return;
      }

      setKeys(prev => prev.filter(k => k !== key));
      setValuesCache(prev => {
        const { [key]: _, ...rest } = prev;
        return rest;
      });
    } catch (error) {
      console.error('Failed to delete key:', error);
      setMinorError('Failed to delete key');
    }
  };

  useEffect(() => {
    if (space) {
      setValuesCache({});
      fetchKeys();
    }
  }, [space, fetchKeys]);

  const handleAddClick = () => {
    setShowCreateModal(true);
  };

  return (
    <Container className="mt-4 mb-4">
      <Row>
        <Col md={{ span: 1, offset: 2 }} className={'mb-2'}>
          <Button
            variant={'outline-primary'}
            onClick={() => navigate(contextPath)}
            title={'Back'}
          >
            <ArrowLeft01Icon />
          </Button>
        </Col>
        <Col md={6}>
          <span className={'h2'}>Space <code>{space}</code> keys</span>
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
              table={{ responsive: true, striped: true }}
              thead={{
                columns: {
                  key: {
                    label: 'Key',
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
                data: keys.map(key => ({
                  key: {
                    representation: <code>{key}</code>,
                    value: key,
                    className: 'text-center'
                  },
                  actions: {
                    representation: (
                      <ButtonGroup>
                        <Button
                          variant={'outline-primary'}
                          onClick={() => handleUpdate(key)}
                          disabled={!valuesCache[key]?.changed}
                          title={'Update'}
                        >
                          <FloppyDiskIcon />
                        </Button>
                        <Button
                          variant={'danger'}
                          onClick={() => handleDelete(key)}
                          title={'Delete'}
                        >
                          <Delete01Icon />
                        </Button>
                      </ButtonGroup>
                    ),
                    className: 'text-center'
                  }
                })),
                rowBehavior: {
                  expandableContent: (row: CustomTableParts.Row) => {
                    const key = (row.key as CustomTableParts.ReactCell).value as string;
                    return key ? <ExpandableRowContent keyName={key} /> : null;
                  }
                },
                pagination: {
                  pageSize: 50,
                  buttons: {
                    size: 'sm'
                  }
                }
              }}
              loading={loading}
            />
          )}
        </Col>
      </Row>

      <RecordCreateModal
        showModal={showCreateModal}
        setShowModal={setShowCreateModal}
        handleSave={async (key: string, value: string, expiredAt: number | undefined) => {
          try {
            const response = await setValue({
              space,
              key,
              value,
              expiredAt,
            });
            if (response.status !== 200 || !response.data.success) {
              setMinorError(`Failed to create key: ${key}`);
              setShowCreateModal(false);
              return;
            }

            setKeys(prev => [...prev, key]);
            setValuesCache(prev => {
              const { [key]: _, ...rest } = prev;
              return rest;
            });
          } catch (error) {
            console.error(`Failed to create key: ${key}`, error);
            setMinorError(`Failed to create key: ${key}`);
          } finally {
            setShowCreateModal(false);
          }
        }}
      />
    </Container>
  );
};

export default SpaceRecordsPage;
